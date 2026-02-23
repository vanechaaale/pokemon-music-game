import { Title, Text, Stack, Progress, Box } from "@mantine/core";
import { useState, useEffect } from "react";
import { type GameSettings } from "./GameConfiguration";
import SongMultipleChoice from "./SongMultipleChoice";
import { socket, deobfuscateSongLink } from "../util/utils";
import MusicFrame from "./MusicFrame";
import SongAutocomplete from "./SongAutocomplete";
import FinalLeaderboard from "./FinalLeaderboard";

const TIME_BETWEEN_ROUNDS = 8;

// Types for server events
interface RoundStartData {
  round: number;
  song: {
    link: string;
    type: string;
    game: string;
  };
  options: { title: string; game: string }[];
  songList: { title: string; game: string }[];
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
}

interface GameOverData {
  finalScores: { name: string; score: number }[];
}

interface MusicQuizProps {
  settings: GameSettings;
  score: number;
  volume: number;
  onUpdateScore: (newScore: number) => void;
  onUpdatePhase: (newPhase: GameSettings["phase"]) => void;
}

export function MusicQuiz(props: MusicQuizProps) {
  const { settings, score, onUpdateScore, volume, onUpdatePhase } = props;

  // Round state from server
  const [currentRound, setCurrentRound] = useState(1);
  const [songLink, setSongLink] = useState<string | null>(null);
  const [multiChoiceOptions, setMultiChoiceOptions] = useState<
    { title: string; game: string }[]
  >([]);
  const [songsList, setSongsList] = useState<{ title: string; game: string }[]>(
    [],
  );

  // Answer state
  const [answered, setAnswered] = useState(false);
  const [answer, setAnswer] = useState<string | undefined>(undefined);
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
  const [videoKey, setVideoKey] = useState(0);

  // Autocomplete state for hard mode
  const [autocompleteValue, setAutocompleteValue] = useState("");

  const handleAutocompleteSubmit = () => {
    if (answered) return;
    handleSubmitAnswer(autocompleteValue);
  };

  // Submit answer to server
  const handleSubmitAnswer = (answer: string | undefined) => {
    if (answered) return;

    socket.emit("submitAnswer", {
      code: settings.code,
      answer: answer ?? null,
      timeRemaining,
    });

    setAnswer(answer);
    setAnswered(true);
  };

  const formatSongName = (song: { title: string; game: string }) => {
    return song.game ? `${song.game}: ${song.title}` : song.title;
  };

  // Listen for server events
  useEffect(() => {
    const handleRoundStart = (data: RoundStartData) => {
      setCurrentRound(data.round);
      setSongLink(deobfuscateSongLink(data.song.link));
      setMultiChoiceOptions(data.options);
      setSongsList(data.songList);
      setTimeRemaining(settings.levelDuration);
      setAnswered(false);
      setCorrectAnswer(null);
      setBetweenRounds(false);
      setVideoKey((k) => k + 1);
      setAutocompleteValue("");
      onUpdatePhase("IN_PROGRESS");
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
        onUpdateScore(myResult.score);
      }
    };

    const handleGameOver = (data: GameOverData) => {
      setIsGameOver(true);
      setFinalScores(data.finalScores);
      setBetweenRounds(false);
    };

    socket.on("roundStart", handleRoundStart);
    socket.on("roundEnd", handleRoundEnd);
    socket.on("gameOver", handleGameOver);

    // Request current round state in case we missed roundStart
    socket.emit("getCurrentRound", settings.code);

    return () => {
      socket.off("roundStart", handleRoundStart);
      socket.off("roundEnd", handleRoundEnd);
      socket.off("gameOver", handleGameOver);
    };
  }, [
    settings.players,
    settings.code,
    onUpdateScore,
    settings.levelDuration,
    onUpdatePhase,
  ]);

  useEffect(() => {
    if (betweenRounds || timeRemaining <= 0 || isGameOver) return;

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

  if (!songLink) {
    return <Text>Waiting for round to start...</Text>;
  }

  return (
    settings.started && (
      // Forcing the position of this component isn't ideal,
      // but for a game this small I think it's fine...
      <Stack
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          borderRadius: "8px",
          padding: "1rem",
          backgroundColor: "white",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        {isGameOver ? (
          <FinalLeaderboard
            finalScores={finalScores}
            players={settings.players}
          />
        ) : (
          <>
            <Title order={3} mb="md">
              Round {currentRound} / {settings.numberOfRounds}
            </Title>
            <Box
              style={{
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "row",
              }}
            >
              <Box>
                <MusicFrame
                  key={videoKey}
                  songLink={songLink}
                  difficulty={settings.difficulty}
                  betweenRounds={betweenRounds}
                  volume={volume}
                />
                <Box style={{ marginTop: "1rem" }}>
                  <Text size="sm" fw={500} ta="center">
                    {betweenRounds
                      ? `Next round in ${timeBetweenRounds}s...`
                      : `${timeRemaining}s`}
                  </Text>
                  <Progress
                    value={
                      betweenRounds
                        ? (timeBetweenRounds / TIME_BETWEEN_ROUNDS) * 100
                        : (timeRemaining / settings.levelDuration) * 100
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
                </Box>
              </Box>
            </Box>
            {/* Answer Section */}
            <Box
              style={{ width: "100%", height: "100%", position: "relative" }}
            >
              {settings.difficulty !== "hard" ? (
                <SongMultipleChoice
                  options={multiChoiceOptions}
                  answered={answered}
                  answer={answer || ""}
                  betweenRounds={betweenRounds}
                  handleAnswer={handleSubmitAnswer}
                  correctAnswer={
                    correctAnswer ? formatSongName(correctAnswer) : null
                  }
                />
              ) : (
                <SongAutocomplete
                  value={autocompleteValue}
                  onChange={setAutocompleteValue}
                  onSubmit={handleAutocompleteSubmit}
                  songs={songsList}
                  disabled={answered || betweenRounds}
                  betweenRounds={betweenRounds}
                  isCorrect={isCorrect}
                  correctAnswer={
                    correctAnswer ? formatSongName(correctAnswer) : null
                  }
                />
              )}
            </Box>
          </>
        )}
      </Stack>
    )
  );
}

export default MusicQuiz;
