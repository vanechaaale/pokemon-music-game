import {
  AspectRatio,
  Paper,
  Title,
  Text,
  Stack,
  Group,
  Progress,
} from "@mantine/core";
import { useState, useEffect } from "react";
import { type GameSettings } from "./GameConfiguration";
import SongMultipleChoice from "./SongMultipleChoice";
import { socket } from "../util/utils";
import MusicFrame from "./MusicFrame";
import SongAutocomplete from "./SongAutocomplete";

const TIME_BETWEEN_ROUNDS = 8;

// Types for server events
interface RoundStartData {
  round: number;
  totalRounds: number;
  song: {
    link: string;
    type: string;
    game: string;
  };
  options: { title: string; game: string }[];
  songList: { title: string; game: string }[];
  duration: number;
  difficulty: "easy" | "normal" | "hard";
}

interface RoundEndData {
  correctAnswer: { title: string; game: string };
  results: {
    playerId: string;
    name: string;
    score: number;
    wasCorrect: boolean;
    answer: string | null;
  }[];
  round: number;
  totalRounds: number;
}

interface GameOverData {
  finalScores: { name: string; score: number }[];
  totalRounds: number;
}

interface MusicContainerProps {
  settings: GameSettings;
}

export function MusicContainer(props: MusicContainerProps) {
  const { settings } = props;

  // Round state from server
  const [currentRound, setCurrentRound] = useState(1);
  const [totalRounds, setTotalRounds] = useState(settings.numberOfRounds);
  const [songLink, setSongLink] = useState<string | null>(null);
  const [multiChoiceOptions, setMultiChoiceOptions] = useState<
    { title: string; game: string }[]
  >([]);
  const [songsList, setSongsList] = useState<{ title: string; game: string }[]>(
    [],
  );
  const [difficulty, setDifficulty] = useState<"easy" | "normal" | "hard">(
    settings.difficulty,
  );
  const [duration, setDuration] = useState(settings.levelDuration);

  // Answer state
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState<{
    title: string;
    game: string;
  } | null>(null);

  // Timer state
  const [timeRemaining, setTimeRemaining] = useState(settings.levelDuration);
  const [timeBetweenRounds, setTimeBetweenRounds] =
    useState(TIME_BETWEEN_ROUNDS);
  const [betweenRounds, setBetweenRounds] = useState(false);

  // Game state
  const [isGameOver, setIsGameOver] = useState(false);
  const [finalScores, setFinalScores] = useState<
    { name: string; score: number }[]
  >([]);
  const [myScore, setMyScore] = useState(0);
  const [videoKey, setVideoKey] = useState(0);

  // Autocomplete state for hard mode
  const [autocompleteValue, setAutocompleteValue] = useState("");

  const handleAutocompleteSubmit = () => {
    if (answered) return;
    handleAnswer(autocompleteValue);
  };

  // Listen for server events
  useEffect(() => {
    const handleRoundStart = (data: RoundStartData) => {
      setCurrentRound(data.round);
      setTotalRounds(data.totalRounds);
      setSongLink(data.song.link);
      setMultiChoiceOptions(data.options);
      setSongsList(data.songList);
      setDuration(data.duration);
      setDifficulty(data.difficulty);
      setTimeRemaining(data.duration);
      setAnswered(false);
      setSelectedAnswer(null);
      setCorrectAnswer(null);
      setBetweenRounds(false);
      setVideoKey((k) => k + 1);
      setAutocompleteValue("");
    };

    const handleRoundEnd = (data: RoundEndData) => {
      setCorrectAnswer(data.correctAnswer);
      setBetweenRounds(true);
      setTimeBetweenRounds(TIME_BETWEEN_ROUNDS);
      setVideoKey((k) => k + 1);

      // Find my result
      const myResult = data.results.find(
        (r) =>
          r.playerId ===
          settings.players.find((p) => p.socketId === socket.id)?.id,
      );
      if (myResult) {
        setIsCorrect(myResult.wasCorrect);
        setMyScore(myResult.score);
      }
    };

    const handleGameOver = (data: GameOverData) => {
      setIsGameOver(true);
      setFinalScores(data.finalScores);
      setBetweenRounds(false);
    };

    const handleAnswerReceived = () => {
      setAnswered(true);
    };

    socket.on("roundStart", handleRoundStart);
    socket.on("roundEnd", handleRoundEnd);
    socket.on("gameOver", handleGameOver);
    socket.on("answerReceived", handleAnswerReceived);

    return () => {
      socket.off("roundStart", handleRoundStart);
      socket.off("roundEnd", handleRoundEnd);
      socket.off("gameOver", handleGameOver);
      socket.off("answerReceived", handleAnswerReceived);
    };
  }, [settings.players]);

  // Client-side timer for UI display (server is authoritative)
  useEffect(() => {
    if (answered || betweenRounds || timeRemaining <= 0 || isGameOver) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [answered, betweenRounds, timeRemaining, isGameOver]);

  // Review phase countdown (UI only)
  useEffect(() => {
    if (!betweenRounds || timeBetweenRounds <= 0 || isGameOver) return;

    const timer = setInterval(() => {
      setTimeBetweenRounds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [betweenRounds, timeBetweenRounds, isGameOver]);

  // Submit answer to server
  const handleAnswer = (answer: string | undefined) => {
    if (answered) return;

    setSelectedAnswer(answer ?? null);
    socket.emit("submitAnswer", {
      code: settings.code,
      answer: answer ?? null,
    });
  };

  const formatSongName = (song: { title: string; game: string }) => {
    return song.game ? `${song.game}: ${song.title}` : song.title;
  };

  if (!songLink) {
    return <Text>Waiting for round to start...</Text>;
  }

  return (
    <Paper shadow="sm" p="lg" radius="md" withBorder>
      <Group justify="space-between" mb="md">
        <Title order={3}>
          Round {currentRound} / {totalRounds}
        </Title>
        <Text fw={500}>Score: {myScore}</Text>
      </Group>

      {isGameOver ? (
        <Paper p="lg" withBorder bg="blue.1" style={{ marginBottom: "1rem" }}>
          <Title order={3} ta="center">
            Game Over!
          </Title>
          <Text ta="center" size="xl" fw={700} mt="sm">
            Final Score: {myScore} / {totalRounds}
          </Text>
          <Stack gap="xs" mt="md">
            {finalScores.map((player, index) => (
              <Text key={index} ta="center">
                {index + 1}. {player.name}: {player.score}
              </Text>
            ))}
          </Stack>
        </Paper>
      ) : null}

      {/* Result Feedback */}
      {correctAnswer && (
        <Paper p="md" withBorder bg={isCorrect ? "green.1" : "red.1"} mb="md">
          <Text fw={500} c={isCorrect ? "green" : "red"}>
            {(isCorrect ? "✓ Correct!" : "✗ Wrong!") +
              ` The answer was: ${formatSongName(correctAnswer)}`}
          </Text>
        </Paper>
      )}

      <Stack gap="lg" style={{ marginTop: "1rem" }}>
        {/* YouTube Video Player */}
        <AspectRatio ratio={16 / 9} style={{ pointerEvents: "none" }}>
          <MusicFrame
            key={videoKey}
            songLink={songLink}
            difficulty={difficulty}
            betweenRounds={betweenRounds}
          />
        </AspectRatio>

        {/* Timer */}
        {!isGameOver && (
          <Group gap="xs" mb="md">
            <Text size="sm" fw={500} w={40} ta="center">
              {betweenRounds ? (
                <Text ta="center" c="dimmed">
                  Next round in {timeBetweenRounds}s...
                </Text>
              ) : (
                `${timeRemaining}s`
              )}
            </Text>

            <Progress
              value={
                betweenRounds
                  ? (timeBetweenRounds / TIME_BETWEEN_ROUNDS) * 100
                  : (timeRemaining / duration) * 100
              }
              size="lg"
              radius="xl"
              color={
                betweenRounds
                  ? "grape"
                  : timeRemaining <= 5
                    ? "red"
                    : timeRemaining <= 10
                      ? "yellow"
                      : "blue"
              }
              style={{ flex: 1 }}
              animated={
                (!answered && timeRemaining > 0) ||
                (betweenRounds && timeBetweenRounds > 0)
              }
            />
          </Group>
        )}

        {/* Answer Section */}
        {!answered && !isGameOver && (
          <Paper p="md" withBorder>
            <Text fw={500} mb="sm">
              What song is this?
            </Text>
            {difficulty !== "hard" ? (
              <SongMultipleChoice
                options={multiChoiceOptions}
                answered={answered}
                correctAnswer={correctAnswer}
                selectedAnswer={selectedAnswer}
                handleAnswer={handleAnswer}
              />
            ) : (
              <SongAutocomplete
                value={autocompleteValue}
                onChange={setAutocompleteValue}
                onSubmit={handleAutocompleteSubmit}
                songs={songsList}
                disabled={answered}
              />
              // <Text c="dimmed">Hard mode autocomplete coming soon...</Text>
            )}
          </Paper>
        )}
      </Stack>
    </Paper>
  );
}

export default MusicContainer;
