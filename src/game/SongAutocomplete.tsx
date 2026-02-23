import { Stack, Autocomplete, Button, Box, Text } from "@mantine/core";

interface SongOption {
  title: string;
  game: string;
}

interface SongAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  songs: SongOption[];
  betweenRounds: boolean;
  isCorrect: boolean;
  correctAnswer: string | null;
  disabled?: boolean;
}

function formatSongName(song: SongOption): string {
  return song.game ? `${song.game}: ${song.title}` : song.title;
}

export function SongAutocomplete(props: SongAutocompleteProps) {
  const {
    value,
    onChange,
    onSubmit,
    songs,
    disabled,
    betweenRounds,
    isCorrect,
    correctAnswer,
  } = props;

  return (
    <Stack gap="sm" style={{ height: "30vh", width: "50vh" }}>
      <Autocomplete
        value={value}
        onChange={onChange}
        data={songs.map(formatSongName)}
        placeholder="Type to search for the song..."
        disabled={disabled}
      />
      <Button onClick={() => onSubmit(value)} disabled={disabled || !value}>
        Submit Answer
      </Button>
      {betweenRounds && correctAnswer && (
        <Box
          p="md"
          mt="md"
          bg={isCorrect ? "green.1" : "red.1"}
          style={{ borderRadius: "8px" }}
        >
          <Text ta="center" fw={500}>
            {isCorrect ? "Correct!" : "Wrong!"} The answer is:{"\n"}
          </Text>
          <Text ta="center" fw={600}>
            {correctAnswer}
          </Text>
        </Box>
      )}
    </Stack>
  );
}

export default SongAutocomplete;
