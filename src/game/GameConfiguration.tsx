import {
  Stack,
  SegmentedControl,
  Slider,
  MultiSelect,
  NumberInput,
  Text,
  Title,
  Box,
  Button,
} from "@mantine/core";
import { useCallback, useState } from "react";
import type { MusicSource, SongType } from "../util/utils";

export interface Player {
  id: string;
  name: string;
  icon: string;
  score: number;
  volume: number;
  socketId: string;
}

export interface GameSettings {
  code: string;
  players: Player[];
  hostSocketId: string;
  songs: { link: string; type: string; game: string }[];
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
  { value: "battle_theme", label: "Battle" },
  { value: "location", label: "City/Town/Cave" },
  { value: "route", label: "Route/Path" },
  { value: "action", label: "Action (Biking/Surfing)" },
  { value: "theme", label: "Theme" },
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
    "battle_theme",
    "location",
    "route",
    "action",
    "theme",
  ]);
  const [musicSources, setMusicSources] = useState<MusicSource[]>([
    "red_blue",
    "gold_silver",
    "ruby_sapphire",
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
      <>
        <Title order={3} mb="md">
          Game Configuration
        </Title>
        <Text mb="md">Lobby ID: {settings?.code || "N/A"}</Text>
        <Stack
          style={{
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
          }}
          gap="xl"
        >
          <Box
            style={{
              width: "50%",
              display: "flex",
              gap: "1rem",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Box style={{ marginBottom: "1rem", width: "100%" }}>
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
            <Box
              style={{ width: "50%", overflow: "hidden", marginBottom: "1rem" }}
            >
              <Text fw={500} mb="xs">
                Rounds
              </Text>
              <NumberInput
                value={numberOfRounds}
                onChange={(value) =>
                  setNumberOfRounds(typeof value === "number" ? value : 1)
                }
                min={1}
                max={50}
                step={1}
              />
            </Box>
            <Box>
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
          </Box>

          <Box
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Text mb="xs">Music Selection</Text>
            <MultiSelect
              value={musicSources}
              onChange={(value) => setMusicSources(value as MusicSource[])}
              data={[
                { value: "red_blue", label: "Red/Blue" },
                { value: "gold_silver", label: "Gold/Silver" },
                { value: "theme_songs", label: "Anime" },
                { value: "ruby_sapphire", label: "Ruby/Sapphire" },
                { value: "diamond_pearl", label: "Diamond/Pearl" },
                { value: "firered_leafgreen", label: "FireRed/LeafGreen" },
                { value: "heartgold_soulsilver", label: "HeartGold/SoulSilver" },
              ]}
              placeholder="Select music sources"
              clearable
              style={{ width: "100%" }}
            />
            <Text mb="xs" style={{ marginTop: "1rem" }}>
              Filters
            </Text>
            <MultiSelect
              value={songTypes}
              onChange={(value) => setSongTypes(value as SongType[])}
              data={SONG_TYPE_OPTIONS}
              placeholder="Select filters"
              clearable
              style={{ width: "100%" }}
            />
          </Box>
        </Stack>

        <Button onClick={startGame} mt="xl" size="md">
          Start Game
        </Button>
   </> )
  );
}

export default GameConfiguration;
