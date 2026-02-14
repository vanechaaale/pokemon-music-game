import { Box, Grid, Popover, Stack, Text, TextInput } from "@mantine/core";
import type { GameSettings, Player } from "./GameConfiguration";
import { socket } from "../util/utils";
import { useMemo } from "react";
import { useDisclosure } from "@mantine/hooks";

interface GameDetailsProps {
  lobbyId: string;
  settings: GameSettings | null;
  currentPlayer: Player | null;
  isHost?: boolean;
  phase: "LOBBY" | "IN_PROGRESS" | "REVIEW" | "GAME_OVER";
  roundResults?: {
    playerId: string;
    name: string;
    score: number;
    pointsEarned: number;
    newScore: number;
    wasCorrect: boolean;
    answer: string | null;
  }[];
}

export function GameDetails(props: GameDetailsProps) {
  const { lobbyId, settings, roundResults, phase } = props;
  const [playerIconOpen, { close, toggle }] = useDisclosure(false);

  console.log("phase:", phase);
  const iconOptions = useMemo(() => {
    const icons = [];
    for (let i = 1; i <= 151; i++) {
      icons.push({
        label: `Icon ${i}`,
        value: `https://raw.githubusercontent.com/PMDCollab/SpriteCollab/master/portrait/${String(i).padStart(4, "0")}/Normal.png`,
      });
    }
    return icons;
  }, []);

  return (
      <Stack 
       style={{
        padding: "1rem",
        align: "flex-start",
        justify: "flex-start",
       }}
      >
        <Text size="lg" style={{ marginBottom: "0.5rem" }} fw={500}>
          {!settings?.started ? "Players:" : "Leaderboard:"}
        </Text>
        {settings?.players.map((player, index) => (
          <Box
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: "1rem",
              marginBottom: "0.5rem",
            }}
          >
            <Popover
              opened={
                playerIconOpen &&
                !settings.started &&
                player.socketId === socket.id
              }
              onClose={close}
              onDismiss={close}
              position="right-start"
              withArrow
              shadow="md"
              width="50vh"
            >
              <Popover.Target>
                <img
                  onClick={() => {
                    if (!settings.started && player.socketId === socket.id) {
                      toggle();
                    }
                  }}
                  key={player.id || index}
                  src={player.icon}
                  alt="Profile Icon"
                  width={64}
                  height={64}
                  style={{
                    display: "block",
                    borderRadius: "50%",
                    outline: "black solid 1px",
                    cursor:
                      player.socketId === socket.id ? "pointer" : "default",
                  }}
                  className={
                    player.socketId === socket.id ? "hover-outline" : ""
                  }
                />
              </Popover.Target>
              <Popover.Dropdown>
                <Text mb="sm" fw={500}>
                  Change Icon:
                </Text>
                <Grid
                  style={{ overflowY: "scroll", maxHeight: "42vh", padding: 1 }}
                >
                  {iconOptions.map((option) => (
                    <Grid.Col
                      span={{ xs: 6, sm: 4, md: 3, lg: 2 }}
                      key={option.value}
                      style={{ display: "flex", justifyContent: "center" }}
                    >
                      <img
                        key={option.value}
                        src={option.value}
                        alt={option.label}
                        width={48}
                        height={48}
                        style={{
                          cursor: "pointer",
                          borderRadius: "50%",
                          outline: "black solid 1px",
                        }}
                        className="hover-outline"
                        onClick={() => {
                          socket.emit("playerEdit", {
                            code: lobbyId,
                            player: {
                              ...player,
                              icon: option.value,
                            },
                          });
                          close();
                        }}
                      />
                    </Grid.Col>
                  ))}
                </Grid>
              </Popover.Dropdown>
            </Popover>
            {player.socketId === socket.id && !settings.started ? (
              <TextInput
                key={player.id || index}
                defaultValue={player.name}
                onBlur={(e) => {
                  const newName = e.currentTarget.value;
                  if (newName !== player.name) {
                    socket.emit("playerEdit", {
                      code: lobbyId,
                      player: {
                        ...player,
                        name: newName,
                      },
                    });
                  }
                }}
                placeholder="Enter your name"
                size="md"
              />
            ) : (
              <>
                <Text
                  key={player.id || index}
                  c={player.socketId === socket.id ? "blue" : "black"}
                >
                  {player.name}
                </Text>

                {phase === "REVIEW" && roundResults && (
                  <>
                    <Box
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                      }}
                    >
                      <Text
                        c={
                          roundResults.find(
                            (result) => result.playerId === player.id,
                          )?.wasCorrect
                            ? "green"
                            : "red"
                        }
                        size="sm"
                      >
                        {roundResults.find(
                          (result) => result.playerId === player.id,
                        )?.wasCorrect
                          ? `+${roundResults.find((result) => result.playerId === player.id)?.pointsEarned}`
                          : "+0"}
                      </Text>
                    </Box>
                  </>
                )}
                {settings?.started && (
                  <Text size="sm" c="dimmed" style={{ marginLeft: "auto" }}>
                    {
                      roundResults?.find(
                        (result) => result.playerId === player.id,
                      )?.score
                    }
                  </Text>
                )}
              </>
            )}
          </Box>
        )) || <Text>No players joined yet</Text>}
      </Stack>
  );
}

export default GameDetails;
