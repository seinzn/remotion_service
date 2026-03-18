import React from "react";
import { Img } from "remotion";
import { Fade } from "./transitions/Fade";

interface ImageClipProps {
  src: string;
  durationInFrames: number;
}

export const ImageClip: React.FC<ImageClipProps> = ({ src, durationInFrames }) => {
  return (
    <Fade durationInFrames={durationInFrames}>
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#000",
        }}
      >
        <Img
          src={src}
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
            objectFit: "contain",
          }}
        />
      </div>
    </Fade>
  );
};
