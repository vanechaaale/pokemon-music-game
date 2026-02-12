import { Box, Text } from "@mantine/core";
import type { GameSettings, Player } from "./GameConfiguration";
import { socket } from "../util/utils";

interface GameDetailsProps {
  lobbyId: string;
  settings: GameSettings | null;
  currentPlayer: Player | null;
  isHost?: boolean;
}

export function GameDetails({ lobbyId, settings }: GameDetailsProps) {
  console.log("players:", settings?.players);
  return (
    <Box p="md">
      <Text size="sm" c="dimmed">
        Lobby ID: {lobbyId}
      </Text>
      <Box style={{ marginTop: "1rem" }}>
        <Text c="dimmed" size="lg">
          Players:
        </Text>
        {settings?.players?.map((player, index) => (
          <Text
            key={player.id || index}
            c={player.socketId === socket.id ? "blue" : "black"}
          >
            {player.name}
          </Text>
        )) || <Text>No players joined yet</Text>}
      </Box>
      {settings?.started ? (
        <Box style={{ marginTop: "1rem" }}>
          <Text>Difficulty: {settings.difficulty}</Text>
          <Text>Music Categories: {settings.songTypes.join(", ")}</Text>
        </Box>
      ) : (
        <></>
      )}
    </Box>
  );
}
