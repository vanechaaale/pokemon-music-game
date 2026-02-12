import { Stack, Button } from "@mantine/core";

interface SongOption {
  title: string;
  game: string;
}

interface SongMultipleChoiceProps {
  options: SongOption[];
  answered: boolean;
  correctAnswer: SongOption | null;
  selectedAnswer: string | null;
  handleAnswer: (answer: string) => void;
}

function formatSongName(song: SongOption): string {
  return song.game ? `${song.game}: ${song.title}` : song.title;
}

export default function SongMultipleChoice(props: SongMultipleChoiceProps) {
  const { options, answered, correctAnswer, selectedAnswer, handleAnswer } =
    props;
  return (
    <Stack gap="sm">
      {options.map((option) => {
        const isCorrect = correctAnswer?.title === option.title;
        const isSelected = selectedAnswer === option.title;
        return (
          <Button
            key={formatSongName(option)}
            variant={
              answered
                ? isCorrect
                  ? "filled"
                  : isSelected
                    ? "light"
                    : "default"
                : "default"
            }
            color={
              answered
                ? isCorrect
                  ? "green"
                  : isSelected
                    ? "red"
                    : "gray"
                : "blue"
            }
            onClick={() => handleAnswer(option.title)}
            disabled={answered}
            fullWidth
          >
            {formatSongName(option)}
          </Button>
        );
      })}
    </Stack>
  );
}
