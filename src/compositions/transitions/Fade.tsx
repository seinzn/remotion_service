import React from "react";
import { interpolate, useCurrentFrame } from "remotion";

interface FadeProps {
  children: React.ReactNode;
  durationInFrames: number;
  transitionFrames?: number;
}

export const Fade: React.FC<FadeProps> = ({
  children,
  durationInFrames,
  transitionFrames = 15,
}) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(
    frame,
    [0, transitionFrames, durationInFrames - transitionFrames, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return <div style={{ opacity, width: "100%", height: "100%" }}>{children}</div>;
};
