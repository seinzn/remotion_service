import React from "react";
import { OffthreadVideo } from "remotion";
import { Fade } from "./transitions/Fade";

interface VideoClipProps {
  src: string;
  durationInFrames: number;
}

export const VideoClip: React.FC<VideoClipProps> = ({ src, durationInFrames }) => {
  return (
    <Fade durationInFrames={durationInFrames}>
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#000",
        }}
      >
        <OffthreadVideo
          src={src}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
        />
      </div>
    </Fade>
  );
};
