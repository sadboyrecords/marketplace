import React from "react";
import ArrowRight from "@/components/iconComponents/ArrowRight";
// import Pause from "components/iconComponents/Pause";
// import Play from "components/iconComponents/Play";
import Rewind from "@/components/iconComponents/Rewind";
import REPEAT from "@/components/iconComponents/Repeat";
import {
  PlayIcon as Play,
  PauseIcon as Pause,
} from "@heroicons/react/24/solid";
import RepeatOnce from "@/components/iconComponents/ShuffleOnce";
import Replay from "../iconComponents/Replay";
import Shuffle from "../iconComponents/Shuffle";

const Icons = {
  FORWARD: ArrowRight,
  BACKWARD: Rewind,
  PAUSE: Pause,
  PLAY: Play,
  REPEAT: REPEAT,
  REPEAT_ONCE: RepeatOnce,
  REPLAY: Replay,
  SHUFFLE: Shuffle,
};

type IconProps = {
  name?:
    | "FORWARD"
    | "PLAY"
    | "PAUSE"
    | "REPEAT"
    | "BACKWARD"
    | "REPEAT_ONCE"
    | "REPLAY"
    | "SHUFFLE";

  className?: string;
  style?: React.CSSProperties;
  width?: number;
  height?: number;
};

const Icon = ({
  name = "BACKWARD",
  className,
  style,
}: // width,
// height,
IconProps) => {
  const IconSVG = Icons[name];

  if (!IconSVG) {
    return null;
  }

  return <IconSVG style={style} className={className} />;
};

export default Icon;
