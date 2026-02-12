import {
  Stack,
  SegmentedControl,
  Slider,
  MultiSelect,
  NumberInput,
  Text,
  Paper,
  Title,
  Box,
  Button,
} from "@mantine/core";
import { useCallback, useState } from "react";
import type { MusicSource, SongType } from "../util/utils";

export interface Player {
  id: string;
  name: string;
  score: number;
  socketId: string;
}

export interface GameSettings {
  code: string;
  players: Player[];
  hostSocketId: string;
  phase: "LOBBY" | "IN_PROGRESS" | "REVIEW" | "GAME_OVER";
  round: number;
  difficulty: "easy" | "normal" | "hard";
  levelDuration: number;
  songTypes: SongType[];
  musicSources: MusicSource[];
  numberOfRounds: number;
  started: boolean;
}

interface GameConfigurationProps {
  started: boolean;
  onStartGame: (settings: GameSettings) => void;
  settings?: GameSettings;
}

const SONG_TYPE_OPTIONS = [
  { value: "location", label: "Location" },
  { value: "route", label: "Route" },
  { value: "battle_theme", label: "Battle" },
  { value: "action", label: "Action (Biking/Surfing)" },
  { value: "theme_song", label: "Theme" },
  { value: "event", label: "Event" },
];

export function GameConfiguration({
  settings,
  started,
  onStartGame,
}: GameConfigurationProps) {
  const [difficulty, setDifficulty] = useState<"easy" | "normal" | "hard">(
    "normal",
  );
  const [levelDuration, setLevelDuration] = useState(20);
  const [songTypes, setSongTypes] = useState<SongType[]>([
    "location",
    "route",
    "battle_theme",
  ]);
  const [musicSources, setMusicSources] = useState<MusicSource[]>([
    "red_blue",
    "gold_silver",
    "theme_songs",
  ]);
  const [numberOfRounds, setNumberOfRounds] = useState(10);

  const startGame = useCallback(() => {
    if (settings) {
      onStartGame({
        ...settings,
        difficulty,
        levelDuration,
        songTypes,
        musicSources,
        numberOfRounds,
        started: true,
      });
    }
  }, [
    onStartGame,
    settings,
    difficulty,
    levelDuration,
    songTypes,
    musicSources,
    numberOfRounds,
  ]);
  return (
    !started && (
      <Paper shadow="sm" p="lg" radius="md" withBorder>
        <Title order={3} mb="md">
          Game Configuration
        </Title>

        <Stack gap="xl">
          {/* Difficulty */}
          <Box style={{ width: "100%" }}>
            <Text fw={500} mb="xs">
              Difficulty
            </Text>
            <SegmentedControl
              value={difficulty}
              onChange={(value) =>
                setDifficulty(value as "easy" | "normal" | "hard")
              }
              data={[
                { label: "Easy", value: "easy" },
                { label: "Normal", value: "normal" },
                { label: "Hard", value: "hard" },
              ]}
              fullWidth
            />
          </Box>

          {/* Number of Rounds */}
          <Box>
            <Text fw={500} mb="xs">
              Number of Rounds
            </Text>
            <NumberInput
              value={numberOfRounds}
              onChange={(value) =>
                setNumberOfRounds(typeof value === "number" ? value : 10)
              }
              min={1}
              max={50}
              step={1}
            />
          </Box>

          {/* Round Duration */}
          <Box style={{ width: "100%" }}>
            <Text fw={500} mb="xs">
              Round Duration: {levelDuration} seconds
            </Text>
            <Slider
              value={levelDuration}
              onChange={setLevelDuration}
              min={10}
              max={30}
              step={1}
              marks={[
                { value: 10, label: "10s" },
                { value: 20, label: "20s" },
                { value: 30, label: "30s" },
              ]}
            />
          </Box>

          {/* Song Types */}
          <Box>
            <Text mb="xs">Song Types</Text>
            <MultiSelect
              value={songTypes}
              onChange={(value) => setSongTypes(value as SongType[])}
              data={SONG_TYPE_OPTIONS}
              placeholder="Select categories"
              clearable
            />
          </Box>

          {/* Music Sources */}
          <Box>
            <Text mb="xs">Music Sources</Text>
            <MultiSelect
              value={musicSources}
              onChange={(value) => setMusicSources(value as MusicSource[])}
              data={[
                { value: "red_blue", label: "Red/Blue" },
                { value: "gold_silver", label: "Gold/Silver" },
                { value: "theme_songs", label: "Theme Songs" },
              ]}
              placeholder="Select music sources"
              clearable
            />
          </Box>
          <Button onClick={startGame} fullWidth mt="xl" size="md">
            Start Game
          </Button>
        </Stack>
      </Paper>
    )
  );
}

export default GameConfiguration;
