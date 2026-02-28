import { Box, Grid, GridCol } from "@mantine/core";
import { useParams } from "react-router-dom";
import GameConfiguration, { type GameSettings } from "./GameConfiguration";
import MusicQuiz from "./MusicQuiz";
import { useState, useEffect, useCallback } from "react";
import { GameDetails } from "./GameDetails";
import { getRandomGiphy, socket } from "../util/utils";
import { notifications } from "@mantine/notifications";

export interface RoundResult {
  playerId: string;
  name: string;
  score: number;
  pointsEarned: number;
  newScore: number;
  wasCorrect: boolean;
  answer: string | null;
}

export function PokemonMusicQuiz() {
  const { lobbyId } = useParams<{ lobbyId: string }>();
  const [gameSettings, setGameSettings] = useState<GameSettings | null>(null);
  const [roundResults, setRoundResults] = useState<RoundResult[]>([]);
  const currentPlayer =
    gameSettings?.players.find((p) => p.socketId === socket.id) || null;
  const [volume, setVolume] = useState(currentPlayer?.volume || 50);
  const isHost = currentPlayer?.socketId === gameSettings?.hostSocketId;
  const [phase, setPhase] = useState(gameSettings?.phase || "LOBBY");
  const [gifUrl, setGifUrl] = useState<string>("");

  const startGame = useCallback(
    (settings: GameSettings) => {
      socket.emit("startGame", { code: lobbyId, settings });
    },
    [lobbyId],
  );

  const handlePlayAgain = useCallback(() => {
    socket.emit("playAgain", { code: lobbyId });
  }, [lobbyId]);

  useEffect(() => {
    // Listen for lobby updates (players joining, or returning to lobby after play again)
    const handleLobbyUpdate = (game: GameSettings) => {
      setGameSettings(game);
      if (!game.started) {
        setPhase("LOBBY");
        setRoundResults([]);
      }
    };

    const handleGameStarted = (game: GameSettings) => {
      setGameSettings(game);
    };

    socket.on("lobbyUpdate", handleLobbyUpdate);
    socket.on("gameStarted", handleGameStarted);

    return () => {
      socket.off("lobbyUpdate", handleLobbyUpdate);
      socket.off("gameStarted", handleGameStarted);
    };
  }, []);

  useEffect(() => {
    // Request current lobby state on mount
    if (lobbyId) {
      socket.emit("getLobbyState", lobbyId);
    }
  }, [lobbyId]);

  useEffect(() => {
    // listen for messages
    const handleServerMessage = (message: {
      severity: string;
      description: string;
    }) => {
      notifications.show({
        title: message.severity === "error" ? "Error" : "Info",
        message: message.description,
        position: "bottom-center",
        autoClose: 3000,
        color: message.severity === "error" ? "red" : "blue",
      });
    };

    socket.on("message", handleServerMessage);

    return () => {
      socket.off("message", handleServerMessage);
    };
  }, []);

  useEffect(() => {
    const handleRoundEnd = (
      data: { results: RoundResult[] },
      phase: GameSettings["phase"],
    ) => {
      setRoundResults(data.results);
      setPhase(phase);
    };

    socket.on("roundEnd", handleRoundEnd);

    return () => {
      socket.off("roundEnd", handleRoundEnd);
    };
  }, []);

  // Fetch a random Giphy GIF for waiting (only when in lobby and not host)
  useEffect(() => {
    if (phase === "LOBBY" && !isHost) {
      let cancelled = false;
      (async () => {
        const url = await getRandomGiphy("@pokemon wait");
        if (!cancelled) setGifUrl(url);
      })();
      return () => {
        cancelled = true;
      };
    }
  }, [phase, isHost]);

  if (!gameSettings) {
    return (
      <Box
        style={{ display: "flex", justifyContent: "center", marginTop: "2rem" }}
      >
        Connecting to lobby...
      </Box>
    );
  }
  // when a user joins an in progress game it breaks

  if (!currentPlayer) {
    socket.emit("joinGame", {
      code: lobbyId,
      name: `Player-${socket.id?.slice(-4)}`,
    });
    return (
      <Box
        style={{ display: "flex", justifyContent: "center", marginTop: "2rem" }}
      >
        Joining lobby...
      </Box>
    );
  }

  return (
    <Grid
      style={{
        height: "100vh",
        paddingTop: "3rem",
        backgroundImage: "url('/container_background.png')",
        backgroundSize: "cover",
      }}
    >
      <GridCol
        span={2}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          height: "100%",
          width: "100%",
        }}
      >
        <GameDetails
          lobbyId={lobbyId || ""}
          settings={gameSettings}
          currentPlayer={currentPlayer}
          isHost={isHost}
          phase={phase}
          roundResults={roundResults}
          playerVolume={volume}
          setPlayerVolume={setVolume}
        />
      </GridCol>
      <GridCol
        span={10}
        style={{
          position: "absolute",
          left: gameSettings?.started ? "10%" : "17%",
          height: "90%",
          width: "100%",
        }}
      >
        {gameSettings?.started ? (
          <MusicQuiz
            settings={gameSettings}
            volume={volume}
            isHost={isHost}
            onUpdatePhase={setPhase}
            onPlayAgain={handlePlayAgain}
          />
        ) : isHost ? (
          <GameConfiguration
            settings={gameSettings || undefined}
            started={gameSettings?.started || false}
            onStartGame={startGame}
          />
        ) : (
          <Box
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <img style={{ marginBottom: "10px" }} src={gifUrl} />
            Waiting for host to start ...
          </Box>
        )}
      </GridCol>
    </Grid>
  );
}
