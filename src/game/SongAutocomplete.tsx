import { Stack, Autocomplete, Button } from "@mantine/core";

interface SongOption {
  title: string;
  game: string;
}

interface SongAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  songs: SongOption[];
  disabled?: boolean;
}

function formatSongName(song: SongOption): string {
  return song.game ? `${song.game}: ${song.title}` : song.title;
}

export function SongAutocomplete(props: SongAutocompleteProps) {
  const { value, onChange, onSubmit, songs, disabled } = props;

  return (
    <Stack gap="sm">
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
    </Stack>
  );
}

export default SongAutocomplete;
