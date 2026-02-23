import { io } from "socket.io-client";
export const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:3001");
const GIPHY_API_KEY = import.meta.env.VITE_GIPHY_API_KEY;
const GIPHY_SEARCH_ENDPOINT = "https://api.giphy.com/v1/gifs/search";
const FALLBACK_GIF = "/gifs/jigglypuff_singing.gif";

export async function getRandomGiphy(query: string): Promise<string> {
  if (!GIPHY_API_KEY) {
    console.warn("VITE_GIPHY_API_KEY is not set, using fallback GIF");
    return FALLBACK_GIF;
  }

  try {
    const limit = 10;
    const url = `${GIPHY_SEARCH_ENDPOINT}?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(query)}&limit=${limit}&rating=g`;

    const response = await fetch(url);
    if (!response.ok) {
      console.error("Giphy API request failed:", response.status);
      return FALLBACK_GIF;
    }

    const data = await response.json();
    const gifs = data.data;

    if (!gifs || gifs.length === 0) {
      return FALLBACK_GIF;
    }

    const randomIndex = Math.floor(Math.random() * gifs.length);
    return gifs[randomIndex].images.original.url;
  } catch (error) {
    console.error("Failed to fetch Giphy GIF:", error);
    return FALLBACK_GIF;
  }
}

export const MUSIC_SELECTIONS = [
                { value: "red_blue", label: "Red/Blue" },
                { value: "gold_silver", label: "Gold/Silver" },
                { value: "theme_songs", label: "Anime" },
                { value: "ruby_sapphire", label: "Ruby/Sapphire" },
                { value: "diamond_pearl", label: "Diamond/Pearl" },
                { value: "firered_leafgreen", label: "FireRed/LeafGreen" },
                {
                  value: "heartgold_soulsilver",
                  label: "HeartGold/SoulSilver",
                },
];

export const MusicSource = {
  RedBlue: 'Red/Blue',
  GoldSilver: 'Gold/Silver',
  RubySapphire: 'Ruby/Sapphire',
  FireRedLeafGreen: 'FireRed/LeafGreen',
  DiamondPearl: 'Diamond/Pearl',
  HeartGoldSoulSilver: 'HeartGold/SoulSilver',
  ThemeSongs: 'Theme Songs',
}
export type MusicSource = 'red_blue' | 'gold_silver' | 'theme_songs' | 'ruby_sapphire' | 'firered_leafgreen' | 'diamond_pearl' | 'heartgold_soulsilver';


export const SongType = {
  Location: 'location',
  Route: 'route',
  Battle: 'battle_theme',
  Action: 'action',
  Theme: 'theme',
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
    if (secondMatch) startSeconds += parseInt(secondMatch[1]) + 2;
  }
  
  return `https://www.youtube.com/embed/${videoId}?start=${startSeconds}&autoplay=1`;
}

export function deobfuscateSongLink(encoded: string): string {
  return atob(encoded).split("").reverse().join("");
}

export function parseYouTubeUrl(link: string): { videoId: string; startSeconds: number } {
  const url = new URL(link);
  const videoId = url.searchParams.get('v') || '';
  const timeParam = url.searchParams.get('t');

  let startSeconds = 0;
  if (timeParam) {
    const minuteMatch = timeParam.match(/(\d+)m/);
    const secondMatch = timeParam.match(/(\d+)s/);
    if (minuteMatch) startSeconds += parseInt(minuteMatch[1]) * 60;
    if (secondMatch) startSeconds += parseInt(secondMatch[1]);
  }

  return { videoId, startSeconds };
}

// Load YouTube IFrame API
let youtubeAPIPromise: Promise<void> | null = null;

export function loadYouTubeAPI(): Promise<void> {
  if (youtubeAPIPromise) return youtubeAPIPromise;

  youtubeAPIPromise = new Promise((resolve) => {
    // If already loaded
    if (window.YT && window.YT.Player) {
      resolve();
      return;
    }

    // Set up callback for when API is ready
    const existingCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (existingCallback) existingCallback();
      resolve();
    };

    // Load the script
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(script);
  });

  return youtubeAPIPromise;
}