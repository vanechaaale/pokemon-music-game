import { Box, Button, Paper, TextInput, Text, Title } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { socket } from "./util/utils";
import { notifications } from "@mantine/notifications";
import "@mantine/notifications/styles.css";

export function Home() {
  const navigate = useNavigate();
  const [gameCode, setGameCode] = useState("");

  useEffect(() => {
    // Debug connection status
    console.log("Socket connected:", socket.connected);

    socket.on("connect", () => {
      console.log("Socket connected successfully!");
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });

    // Listen for gameCreated event
    socket.on("gameCreated", (game) => {
      navigate(`/lobby/${game.code}`);
    });

    // Listen for error messages
    socket.on(
      "message",
      (message: { severity: string; description: string }) => {
        console.log("error:", message);
      },
    );

    return () => {
      socket.off("gameCreated");
      socket.off("connect");
      socket.off("connect_error");
      socket.off("message");
    };
  }, [navigate]);

  const createGame = () => {
    socket.emit("createGame");
  };

  const handleJoinLobby = () => {
    if (gameCode.trim()) {
      const code = gameCode.trim().toUpperCase();
      socket
        .emit("joinGame", { code, name: `Player-${socket.id?.slice(-4)}` })
        .on("joinSuccess", (game) => {
          navigate(`/lobby/${game.code}`);
        })
        .on("message", (message) => {
          notifications.show({
            title:
              message.severity === "error" ? "Error Joining Lobby" : "Info",
            message: message.description,
            position: "bottom-center",
            autoClose: 1000,
            color: message.severity === "error" ? "red" : "blue",
          });
        });
    }
  };

  return (
    <Box
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1rem",
        marginTop: "2rem",
      }}
    >
      <Title> {`Welcome to Pokémon Music Quiz!`}</Title>
      <Text>
        {`Test your knowledge of Pokémon music across all generations. Can you
            name the song from just a few seconds of music?`}
      </Text>
      <Paper p="md" withBorder>
        <TextInput
          label="Lobby ID"
          placeholder="Enter Lobby ID (e.g. ABCD)"
          value={gameCode}
          onChange={(e) => setGameCode(e.currentTarget.value)}
          style={{ marginBottom: "1rem" }}
        />
        <Button
          onClick={handleJoinLobby}
          disabled={!gameCode.trim()}
          style={{ marginRight: "1rem" }}
        >
          Join Lobby
        </Button>
        <Button onClick={createGame}>New Lobby</Button>
      </Paper>
    </Box>
  );
}
