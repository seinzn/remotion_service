import React from "react";
import { Composition } from "remotion";
import { MainVideo } from "./compositions/MainVideo";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="MainVideo"
      component={MainVideo}
      durationInFrames={300}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{
        assets: [],
        musicSrc: "",
        musicVolume: 0.5,
      }}
    />
  );
};
