import { io } from "socket.io-client";

export const socket = io("http://localhost:3001");

export const MusicSource = {
  RedBlue: 'Red/Blue',
  GoldSilver: 'Gold/Silver',
  ThemeSongs: 'Theme Songs',
}
export type MusicSource = 'red_blue' | 'gold_silver' | 'theme_songs';


export const SongType = {
  Location: 'location',
  Route: 'route',
  Battle: 'battle_theme',
  Action: 'action',
  Theme: 'theme_song',
  Event: 'event',
} as const;

export type SongType = typeof SongType[keyof typeof SongType];

export interface Song {
  game: string;
  title: string;
  link: string;
  type: SongType;
}

export function formatSongName(song: Song): string {
  return song.game ? `${song.game}: ${song.title}` : song.title;
}


export function getYouTubeEmbedUrl(link: string): string {
  // Convert YouTube watch URL with timestamp to embed URL
  // Example: https://www.youtube.com/watch?v=X00v_6hFf0g&t=1m0s
  // To: https://www.youtube.com/embed/X00v_6hFf0g?start=60&autoplay=1
  const url = new URL(link);
  const videoId = url.searchParams.get('v');
  const timeParam = url.searchParams.get('t');
  
  let startSeconds = 0;
  if (timeParam) {
    // Parse time like "1m0s" or "10m24s"
    const minuteMatch = timeParam.match(/(\d+)m/);
    const secondMatch = timeParam.match(/(\d+)s/);
    if (minuteMatch) startSeconds += parseInt(minuteMatch[1]) * 60;
    if (secondMatch) startSeconds += parseInt(secondMatch[1]);
  }
  
  return `https://www.youtube.com/embed/${videoId}?start=${startSeconds}&autoplay=1`;
}