import express from "express";
import http from "http";
import { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import { generateCode, shuffleArray, loadSongs } from "./utils/utils.js";


const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

server.listen(3001);

const games = new Map();
const TIME_BETWEEN_ROUNDS = 8;

function startRound(game) {
  // Pick a random song that hasn't been used
  const availableSongs = game.songs.filter(
    (s) => !game.usedSongs.includes(s.title)
  );

  if (availableSongs.length === 0 || game.round >= game.numberOfRounds) {
    endGame(game);
    return;
  }

  const randomIndex = Math.floor(Math.random() * availableSongs.length);
  const selectedSong = availableSongs[randomIndex];

  game.currentSong = selectedSong;
  game.usedSongs.push(selectedSong.title);
  game.round += 1;
  game.playerAnswers = {};
  game.phase = "IN_PROGRESS";

  // Generate multiple choice options (for easy/normal mode)
  let options = [];
  if (game.difficulty !== "hard") {
    const otherSongs = game.songs.filter((s) => s.title !== selectedSong.title);
    const shuffledOthers = shuffleArray(otherSongs).slice(0, 3);
    options = shuffleArray([selectedSong, ...shuffledOthers]).map((s) => ({
      title: s.title,
      game: s.game,
    }));
  }

  // Generate song list for hard mode autocomplete (shuffled to prevent position-based cheating)
  const songList = shuffleArray(game.songs).map((s) => ({
    title: s.title,
    game: s.game,
  }));

  // Emit round start - hide the correct song's title by only sending link
  io.to(game.code).emit("roundStart", {
    round: game.round,
    totalRounds: game.numberOfRounds,
    song: {
      link: selectedSong.link,
      type: selectedSong.type,
      game: selectedSong.game,
      // NOTE: title is intentionally omitted to prevent cheating
    },
    options,
    songList,
    duration: game.levelDuration,
    difficulty: game.difficulty,
  });

  // Set round timer
  if (game.roundTimer) clearTimeout(game.roundTimer);
  game.roundTimer = setTimeout(() => {
    endRound(game);
  }, game.levelDuration * 1000);
}

function endRound(game) {
  if (game.roundTimer) {
    clearTimeout(game.roundTimer);
    game.roundTimer = null;
  }

  game.phase = "REVIEW";

  // Calculate results for each player
  const results = game.players.map((player) => {
    const answer = game.playerAnswers[player.socketId];
    const wasCorrect = answer === game.currentSong.title;
    return {
      playerId: player.id,
      name: player.name,
      score: player.score,
      wasCorrect,
      answer: answer || null,
    };
  });

  // Emit round end with correct answer
  io.to(game.code).emit("roundEnd", {
    correctAnswer: {
      title: game.currentSong.title,
      game: game.currentSong.game,
    },
    results,
    round: game.round,
    totalRounds: game.numberOfRounds,
  });

  // After review period, start next round or end game
  game.reviewTimer = setTimeout(() => {
    if (game.round >= game.numberOfRounds) {
      endGame(game);
    } else {
      startRound(game);
    }
  }, TIME_BETWEEN_ROUNDS * 1000);
}

function endGame(game) {
  if (game.roundTimer) clearTimeout(game.roundTimer);
  if (game.reviewTimer) clearTimeout(game.reviewTimer);

  game.phase = "GAME_OVER";
  game.started = false;

  const finalScores = game.players
    .map((p) => ({ name: p.name, score: p.score }))
    .sort((a, b) => b.score - a.score);

  io.to(game.code).emit("gameOver", {
    finalScores,
    totalRounds: game.numberOfRounds,
  });
}

// Host creates a game
io.on("connection", (socket) => {
  socket.on("createGame", () => {
    const code = generateCode();

    const game = {
      difficulty: "normal",
      levelDuration: 20,
      songTypes: [],
      musicSources: [],
      numberOfRounds: 5,
      started: false,
      code,
      hostSocketId: socket.id,
      players: [
          {
              id: uuidv4(),
              name: "Host",
              score: 0,
              socketId: socket.id
          }
      ],
      phase: "LOBBY",
      round: 0,
    };

    games.set(code, game);

    socket.join(code);

    socket.emit("gameCreated", game);
    io.to(code).emit("lobbyUpdate", game);
  });

  // Players join a game
  socket.on("joinGame", ({ code, name }) => {
    const game = games.get(code);
    if (!game) {
      socket.emit("errorMessage", "Game not found");
      return;
    }

    // if the player is already in the game, ignore the join request
    if (game.players.some(p => p.socketId === socket.id)) {
      return;
    }

    const player = {
      id: uuidv4(),
      name,
      score: 0,
      socketId: socket.id
    };

    game.players.push(player);
    socket.join(code);
    
    io.to(code).emit("lobbyUpdate", game);
  });

  // Client requests current lobby state on mount
  socket.on("getLobbyState", (code) => {
    const game = games.get(code);
    if (game) {
      socket.join(code); // Ensure they're in the room
      socket.emit("lobbyUpdate", game);
    } else {
      socket.emit("errorMessage", "Lobby not found");
    }
  });

  // Host starts the game
  socket.on("startGame", ({ code, settings }) => {
    const game = games.get(code);
    if (!game) {
      socket.emit("errorMessage", "Game not found");
      return;
    }

    if (socket.id !== game.hostSocketId) {
      socket.emit("errorMessage", "Only the host can start the game");
      return;
    }

    debugger;
    // Apply settings
    game.difficulty = settings.difficulty;
    game.levelDuration = settings.levelDuration;
    game.songTypes = settings.songTypes;
    game.musicSources = settings.musicSources;
    game.numberOfRounds = settings.numberOfRounds;
    game.started = true;
    game.round = 0;
    game.usedSongs = [];
    game.playerAnswers = {};
    game.currentSong = null;

    // Load songs based on settings
    game.songs = loadSongs(settings.musicSources, settings.songTypes);

    if (game.songs.length === 0) {
      socket.emit("errorMessage", "No songs found for selected categories");
      return;
    }

    io.to(code).emit("gameStarted", game);

    // Start the first round
    startRound(game);
  });

  // Player submits an answer
  socket.on("submitAnswer", ({ code, answer }) => {
    const game = games.get(code);
    if (!game) return;

    // Find the player
    const player = game.players.find((p) => p.socketId === socket.id);
    if (!player) return;

    // Ignore if already answered or not in progress
    if (game.playerAnswers[socket.id] !== undefined || game.phase !== "IN_PROGRESS") {
      return;
    }

    // Record the answer
    game.playerAnswers[socket.id] = answer;

    // Check if correct and update score
    if (answer === game.currentSong.title) {
      player.score += 1;
    }

    // Notify the player their answer was received
    socket.emit("answerReceived", { answer });

    // Check if all players have answered
    const allAnswered = game.players.every(
      (p) => game.playerAnswers[p.socketId] !== undefined
    );

    if (allAnswered) {
      endRound(game);
    }
  });
});