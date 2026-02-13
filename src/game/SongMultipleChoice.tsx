import { Stack, Button } from "@mantine/core";

interface SongOption {
  title: string;
  game: string;
}

interface SongMultipleChoiceProps {
  options: SongOption[];
  answered: boolean;
  handleAnswer: (answer: string) => void;
}

function formatSongName(song: SongOption): string {
  return song.game ? `${song.game}: ${song.title}` : song.title;
}

export default function SongMultipleChoice(props: SongMultipleChoiceProps) {
  const { options, answered, handleAnswer } = props;
  return (
    <Stack gap="sm">
      {options.map((option) => {
        const formattedName = formatSongName(option);
        return (
          <Button
            key={formattedName}
            variant="default"
            color="gray"
            onClick={() => handleAnswer(formattedName)}
            disabled={answered}
            style={{
              fontSize: ".7rem",
              textAlign: "center",
              flexWrap: "wrap",
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
