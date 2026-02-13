import { ActionIcon, AppShell, Box, Paper, Popover } from "@mantine/core";
import { useParams } from "react-router-dom";
import Header from "../Header";
import GameConfiguration, { type GameSettings } from "./GameConfiguration";
import GameContainer from "./MusicQuizContainer";
import { useState, useEffect, useCallback } from "react";
import { GameDetails } from "./GameDetails";
import { socket } from "../util/utils";
import { notifications } from "@mantine/notifications";
import { useDisclosure } from "@mantine/hooks";
import { IconMusic } from "@tabler/icons-react";

interface RoundResult {
  playerId: string;
  name: string;
  score: number;
  wasCorrect: boolean;
  answer: string | null;
}

export function PokemonMusicQuiz() {
  const { lobbyId } = useParams<{ lobbyId: string }>();
  const [gameSettings, setGameSettings] = useState<GameSettings | null>(null);
  const [score, setScore] = useState(0);
  const [roundResults, setRoundResults] = useState<RoundResult[]>([]);
  const currentPlayer =
    gameSettings?.players.find((p) => p.socketId === socket.id) || null;
  const [volume, setVolume] = useState(currentPlayer?.volume || 50);
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
    const handleRoundEnd = (data: { results: RoundResult[] }) => {
      setRoundResults(data.results);
    };

    socket.on("roundEnd", handleRoundEnd);

    return () => {
      socket.off("roundEnd", handleRoundEnd);
    };
  }, []);
  const [settingsOpen, { close, toggle }] = useDisclosure(false);

  return (
    <AppShell
      header={{ height: "10%" }}
      navbar={{
        width: "20%",
        collapsed: { mobile: true },
        breakpoint: "sm",
      }}
      styles={{
        root: {
          height: "100vh",
        },
      }}
    >
      <Header />
      <AppShell.Navbar p="md">
        <GameDetails
          lobbyId={lobbyId || ""}
          settings={gameSettings}
          currentPlayer={currentPlayer}
          isHost={isHost}
          roundResults={roundResults}
        />
      </AppShell.Navbar>
      <AppShell.Main style={{ width: "100%" }}>
        <Paper
          shadow="sm"
          p="lg"
          radius="md"
          withBorder
          style={{ minWidth: "600px", margin: "0 auto" }}
        >
          <Box style={{ display: "flex", justifyContent: "flex-end" }}>
            <Popover
              opened={settingsOpen}
              onClose={close}
              onDismiss={close}
              position="top"
              withArrow
              shadow="md"
            >
              <Popover.Target>
                <ActionIcon onClick={toggle}>
                  <IconMusic size={25} />
                </ActionIcon>
              </Popover.Target>
              <Popover.Dropdown>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={volume}
                  onChange={(e) => setVolume(parseInt(e.target.value, 10))}
                />
              </Popover.Dropdown>
            </Popover>
          </Box>
          {gameSettings?.started ? (
            <GameContainer
              settings={gameSettings}
              score={score}
              volume={volume}
              onUpdateScore={setScore}
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
        </Paper>
      </AppShell.Main>
    </AppShell>
  );
}
