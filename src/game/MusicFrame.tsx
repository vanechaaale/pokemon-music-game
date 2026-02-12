import { getYouTubeEmbedUrl } from "../util/utils";

interface MusicFrameProps {
  songLink: string;
  difficulty: "easy" | "normal" | "hard";
  betweenRounds: boolean;
}

export function MusicFrame(props: MusicFrameProps) {
  const { songLink, difficulty, betweenRounds } = props;
  const embedUrl = getYouTubeEmbedUrl(songLink);
  const showVideo = difficulty === "easy" || betweenRounds;

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {/* Always render iframe for audio, but hide visually on normal/hard */}
      <iframe
        src={embedUrl}
        title="Pokemon Music"
        style={{
          border: 0,
          width: "100%",
          height: "100%",
          position: "absolute",
          top: 0,
          left: 0,
          opacity: showVideo ? 1 : 0,
          pointerEvents: "none",
        }}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope;"
      />

      {/* Show gif overlay on normal/hard during rounds */}
      {!showVideo && (
        <img
          src="/gifs/jigglypuff_singing.gif"
          alt="Jigglypuff singing"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            position: "absolute",
            top: 0,
            left: 0,
          }}
        />
      )}
    </div>
  );
}

export default MusicFrame;
