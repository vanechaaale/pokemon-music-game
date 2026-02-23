import { Box, Grid, GridCol } from "@mantine/core";
import { useParams } from "react-router-dom";
import GameConfiguration, { type GameSettings } from "./GameConfiguration";
import MusicQuiz from "./MusicQuiz";
import { useState, useEffect, useCallback } from "react";
import { GameDetails } from "./GameDetails";
import { socket } from "../util/utils";
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

  const startGame = useCallback(
    (settings: GameSettings) => {
      socket.emit("startGame", { code: lobbyId, settings });
    },
    [lobbyId],
  );

  useEffect(() => {
    // Listen for lobby updates (players joining)
    const handleLobbyUpdate = (game: GameSettings) => {
      setGameSettings(game);
    };

    const handleGameStarted = (game: GameSettings) => {
      setGameSettings(game);
    };

    socket.on("lobbyUpdate", handleLobbyUpdate);
    socket.on("gameStarted", handleGameStarted);

    // Request current lobby state on mount
    if (lobbyId) {
      socket.emit("getLobbyState", lobbyId);
    }

    return () => {
      socket.off("lobbyUpdate", handleLobbyUpdate);
      socket.off("gameStarted", handleGameStarted);
    };
  }, [lobbyId]);

  useEffect(() => {
    // listen for error messages
    const handleErrorMessage = (message: string) => {
      notifications.show({
        title: "Error",
        message,
        position: "bottom-center",
        autoClose: 3000,
        color: "red",
      });
    };

    socket.on("errorMessage", handleErrorMessage);

    return () => {
      socket.off("errorMessage", handleErrorMessage);
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

  return (
    <Grid>
      <GridCol
        span={2}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          height: "100%",
          width: "100%",
          boxSizing: "border-box",
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
            onUpdatePhase={setPhase}
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
            <img
              style={{ marginBottom: "10px" }}
              src="https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExMXpuNGk0MHppc3R4eTY3NTZvejN0enN6aGpmbnZ1YjZybWNybm55ciZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/ng88DijbQOzq8nPJmv/giphy.gif"
            />
            Waiting for host to start ...
          </Box>
        )}
      </GridCol>
    </Grid>
  );
}
