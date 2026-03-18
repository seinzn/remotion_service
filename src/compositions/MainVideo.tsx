import React from "react";
import { AbsoluteFill, Audio, Sequence } from "remotion";
import { ImageClip } from "./ImageClip";
import { VideoClip } from "./VideoClip";

export interface AssetItem {
  type: "image" | "video";
  src: string;
  durationInFrames: number;
}

interface MainVideoProps {
  assets: AssetItem[];
  musicSrc: string;
  musicVolume?: number;
}

export const MainVideo: React.FC<MainVideoProps> = ({
  assets,
  musicSrc,
  musicVolume = 0.5,
}) => {
  let currentFrame = 0;

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {assets.map((asset, index) => {
        const from = currentFrame;
        currentFrame += asset.durationInFrames;

        return (
          <Sequence
            key={index}
            from={from}
            durationInFrames={asset.durationInFrames}
          >
            {asset.type === "image" ? (
              <ImageClip
                src={asset.src}
                durationInFrames={asset.durationInFrames}
              />
            ) : (
              <VideoClip
                src={asset.src}
                durationInFrames={asset.durationInFrames}
              />
            )}
          </Sequence>
        );
      })}

      <Audio src={musicSrc} volume={musicVolume} />
    </AbsoluteFill>
  );
};
