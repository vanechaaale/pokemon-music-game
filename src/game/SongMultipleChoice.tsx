import { Stack, Button } from "@mantine/core";

interface SongOption {
  title: string;
  game: string;
}

interface SongMultipleChoiceProps {
  options: SongOption[];
  answered: boolean;
  betweenRounds: boolean;
  correctAnswer: string | null;
  answer: string;
  handleAnswer: (answer: string) => void;
}

function formatSongName(song: SongOption): string {
  return song.game ? `${song.game}: ${song.title}` : song.title;
}

export default function SongMultipleChoice(props: SongMultipleChoiceProps) {
  const {
    options,
    answered,
    betweenRounds,
    correctAnswer,
    answer,
    handleAnswer,
  } = props;
  return (
    <Stack gap="sm">
      {options.map((option) => {
        const formattedName = formatSongName(option);
        return (
          <Button
            key={formattedName}
            variant="outline"
            onClick={() => {
              handleAnswer(formattedName);
            }}
            disabled={answered || betweenRounds}
            style={{
              fontSize: ".7rem",
              textAlign: "center",
              flexWrap: "wrap",
              backgroundColor: betweenRounds
                ? answer == formattedName && formattedName === correctAnswer
                  ? "#4ed55dff"
                  : answer == formattedName && formattedName !== correctAnswer
                    ? "#b7414dff"
                    : formattedName === correctAnswer
                      ? "#aaffb4ff"
                      : "#ffcbd1ff"
                : undefined,
              color: answered ? "black" : undefined,
            }}
            fullWidth
          >
            {formattedName}
          </Button>
        );
      })}
    </Stack>
  );
}
