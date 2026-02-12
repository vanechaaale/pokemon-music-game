import { AppShell } from "@mantine/core";
import { useParams } from "react-router-dom";
import Header from "../Header";
import GameConfiguration, { type GameSettings } from "./GameConfiguration";
import MusicContainer from "./MusicContainer";
import { useState, useEffect, useCallback } from "react";
import { GameDetails } from "./GameDetails";
import { socket } from "../util/utils";

export function PokemonMusicGame() {
  const { lobbyId } = useParams<{ lobbyId: string }>();
  const [gameSettings, setGameSettings] = useState<GameSettings | null>(null);
  const currentPlayer =
    gameSettings?.players.find((p) => p.socketId === socket.id) || null;
  const isHost = currentPlayer?.socketId === gameSettings?.hostSocketId;

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

    // Cleanup: remove listeners when component unmounts or lobbyId changes
    // This prevents duplicate listeners from accumulating
    return () => {
      socket.off("lobbyUpdate", handleLobbyUpdate);
      socket.off("gameStarted", handleGameStarted);
    };
  }, [lobbyId]);

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: "sm" }}
      padding="md"
    >
      <Header />
      <AppShell.Navbar p="md">
        <GameDetails
          lobbyId={lobbyId || ""}
          settings={gameSettings}
          currentPlayer={currentPlayer}
          isHost={isHost}
        />
      </AppShell.Navbar>
      <AppShell.Main>
        {gameSettings?.started ? (
          <MusicContainer settings={gameSettings} />
        ) : isHost ? (
          <GameConfiguration
            settings={gameSettings || undefined}
            started={gameSettings?.started || false}
            onStartGame={startGame}
          />
        ) : (
          <>Waiting for host to start ...</>
        )}
      </AppShell.Main>
    </AppShell>
  );
}
