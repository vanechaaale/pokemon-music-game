import { Box, Stack, Text, Title } from "@mantine/core";
import { useMemo } from "react";
import type { Player } from "./GameConfiguration";

interface FinalLeaderboardProps {
  finalScores: { name: string; score: number }[];
  players: Player[];
}

interface RankedEntry {
  name: string;
  score: number;
  rank: number;
}

const PODIUM_COLORS: Record<number, string> = {
  1: "#FFD700", // gold
  2: "#C0C0C0", // silver
  3: "#CD7F32", // bronze
};
const PODIUM_HEIGHTS: Record<number, number> = {
  1: 180,
  2: 130,
  3: 100,
};
const PLACE_LABELS: Record<number, string> = {
  1: "🥇",
  2: "🥈",
  3: "🥉",
};

export function FinalLeaderboard({
  finalScores,
  players,
}: FinalLeaderboardProps) {
  // Find the player icon by matching name
  const getIcon = (name: string) => {
    const player = players.find((p) => p.name === name);
    return player?.icon || "";
  };

  // Assign competition ranks (tied players share a rank, next rank skips)
  const ranked: RankedEntry[] = useMemo(() => {
    const sorted = [...finalScores].sort((a, b) => b.score - a.score);
    return sorted.map((entry, i) => {
      const rank =
        i === 0 || entry.score === sorted[i - 1].score
          ? i === 0
            ? 1
            : sorted.slice(0, i).findIndex((e) => e.score === entry.score) + 1
          : i + 1;
      return { ...entry, rank };
    });
  }, [finalScores]);

  // Group players by rank for the podium (ranks 1–3 only)
  const podiumGroups = useMemo(() => {
    const groups: Record<number, RankedEntry[]> = { 1: [], 2: [], 3: [] };
    for (const entry of ranked) {
      if (entry.rank <= 3) {
        groups[entry.rank].push(entry);
      }
    }
    return groups;
  }, [ranked]);

  // Players beyond rank 3 go in the remaining list
  const remainingPlayers = useMemo(
    () => ranked.filter((e) => e.rank > 3),
    [ranked],
  );

  // Render a single player above a pedestal
  const renderPodiumPlayer = (entry: RankedEntry) => {
    const rank = entry.rank;
    const color = PODIUM_COLORS[rank];
    const height = PODIUM_HEIGHTS[rank];

    return (
      <Box
        key={entry.name}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.25rem",
        }}
      >
        <img
          src={getIcon(entry.name)}
          alt={entry.name}
          width={rank === 1 ? 72 : 56}
          height={rank === 1 ? 72 : 56}
          style={{
            borderRadius: "50%",
            outline: `3px solid ${color}`,
            background: "white",
          }}
        />
        <Text
          size={rank === 1 ? "lg" : "sm"}
          fw={rank === 1 ? 700 : 500}
          ta="center"
          style={{ maxWidth: 120 }}
          lineClamp={1}
        >
          {entry.name}
        </Text>

        {/* Pedestal block */}
        <Box
          style={{
            width: rank === 1 ? 120 : 100,
            height,
            background: `linear-gradient(180deg, ${color} 0%, ${color}99 100%)`,
            borderRadius: "8px 8px 0 0",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-start",
            paddingTop: "0.75rem",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          }}
        >
          <Text size="xl" fw={700}>
            {PLACE_LABELS[rank]}
          </Text>
          <Text size={rank === 1 ? "xl" : "md"} fw={700} c="dark">
            {entry.score}
          </Text>
          <Text size="xs" c="dimmed">
            pts
          </Text>
        </Box>
      </Box>
    );
  };

  const highestScore = ranked[0]?.score || 0;

  return (
    <Stack align="center" gap="md">
      <Title order={2} ta="center">
        Game Over!
      </Title>
      <Text size="lg" ta="center" c="dimmed">
        {ranked.filter((e) => e.score === highestScore).length > 1
          ? `It's a ${ranked.filter((e) => e.score === highestScore).length}-way tie!`
          : `${ranked[0]?.name || "N/A"} wins!`}
      </Text>

      {/* Podium - arranged as 2nd group | 1st group | 3rd group */}
      <Box
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          gap: "0.5rem",
          marginTop: "1rem",
        }}
      >
        {/* 2nd place (left side) */}
        {podiumGroups[2].map(renderPodiumPlayer)}
        {/* 1st place (center) */}
        {podiumGroups[1].map(renderPodiumPlayer)}
        {/* 3rd place (right side) */}
        {podiumGroups[3].map(renderPodiumPlayer)}
      </Box>

      {/* Remaining players listed below the podium */}
      {remainingPlayers.length > 0 && (
        <Stack gap="xs" mt="md" style={{ width: "100%" }}>
          {remainingPlayers.map((entry) => (
            <Box
              key={entry.name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.5rem 1rem",
                background: "#f8f9fa",
                borderRadius: 8,
              }}
            >
              <Text size="sm" fw={600} c="dimmed" style={{ width: 24 }}>
                {entry.rank}.
              </Text>
              <img
                src={getIcon(entry.name)}
                alt={entry.name}
                width={32}
                height={32}
                style={{ borderRadius: "50%" }}
              />
              <Text size="sm" fw={500} style={{ flex: 1 }}>
                {entry.name}
              </Text>
              <Text size="sm" fw={600}>
                {entry.score} pts
              </Text>
            </Box>
          ))}
        </Stack>
      )}
    </Stack>
  );
}

export default FinalLeaderboard;
