import { useEffect, useRef, useState } from "react";
import { loadYouTubeAPI, parseYouTubeUrl, getRandomGiphy } from "../util/utils";
import { AspectRatio, Box } from "@mantine/core";

interface MusicFrameProps {
  songLink: string;
  difficulty: "easy" | "normal" | "hard";
  betweenRounds: boolean;
  volume: number;
}

export function MusicFrame(props: MusicFrameProps) {
  const { songLink, difficulty, betweenRounds, volume } = props;
  const showVideo = difficulty === "easy" || betweenRounds;

  const playerContainerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YT.Player | null>(null);
  const [isReady, setIsReady] = useState(false);
  const initialSongRef = useRef(songLink);
  const [gifUrl, setGifUrl] = useState<string>("");

  // Fetch a random Giphy GIF each time the song changes
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const url = await getRandomGiphy("@pokemon sing");
      if (!cancelled) setGifUrl(url);
    })();
    return () => {
      cancelled = true;
    };
  }, [songLink]);

  useEffect(() => {
    let isMounted = true;

    loadYouTubeAPI().then(() => {
      if (!isMounted || !playerContainerRef.current) return;

      const { videoId, startSeconds } = parseYouTubeUrl(initialSongRef.current);

      playerRef.current = new window.YT.Player(playerContainerRef.current, {
        videoId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          start: startSeconds,
          modestbranding: 1,
          rel: 0,
          enablejsapi: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: (event: YT.PlayerEvent) => {
            if (!isMounted) return;
            setIsReady(true);
            event.target.setVolume(volume);
          },
          onStateChange: (event: YT.OnStateChangeEvent) => {
            event.target.setVolume(volume);
          },
        },
      });
    });

    return () => {
      isMounted = false;
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
      setIsReady(false);
    };
  }, [volume]);

  // Handle song changes
  useEffect(() => {
    if (!isReady || !playerRef.current) return;
    const { videoId, startSeconds } = parseYouTubeUrl(songLink);
    playerRef.current.loadVideoById({ videoId, startSeconds });
  }, [songLink, isReady]);

  return (
    <AspectRatio ratio={16 / 9} style={{ pointerEvents: "none" }}>
      <Box
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          pointerEvents: "none",
        }}
      >
        <div
          ref={playerContainerRef}
          style={{
            width: "100%",
            height: "100%",
            visibility: showVideo ? "visible" : "hidden",
          }}
        />
        {!showVideo && (
          <img
            src={gifUrl}
            alt="Pokémon singing"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              zIndex: 1,
            }}
          />
        )}
      </Box>
    </AspectRatio>
  );
}

export default MusicFrame;
