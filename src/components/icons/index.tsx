import React from "react";
import ArrowRight from "@/components/iconComponents/ArrowRight";
// import Pause from "components/iconComponents/Pause";
// import Play from "components/iconComponents/Play";
import Rewind from "@/components/iconComponents/Rewind";
import Shuffle from "@/components/iconComponents/Shuffle";
import {
  PlayIcon as Play,
  PauseCircleIcon as Pause,
} from "@heroicons/react/24/solid";
import { ShuffleOnce } from "@/components/iconComponents";

const Icons = {
  FORWARD: ArrowRight,
  BACKWARD: Rewind,
  PAUSE: Pause,
  PLAY: Play,
  SHUFFLE: Shuffle,
  SHUFFLE_ONCE: ShuffleOnce,
};

type IconProps = {
  name?: "FORWARD" | "PLAY" | "PAUSE" | "SHUFFLE" | "BACKWARD" | "SHUFFLE_ONCE";
  className?: string;
  style?: React.CSSProperties;
  width?: number;
  height?: number;
};

const Icon = ({
  name = "BACKWARD",
  className,
  style,
  width,
  height,
}: IconProps) => {
  const IconSVG = Icons[name];

  if (!IconSVG) {
    return null;
  }

  return <IconSVG style={style} className={className} />;
};

export default Icon;
