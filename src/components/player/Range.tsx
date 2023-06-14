import React, { useEffect, useState } from "react";
import type ReactPlayer from "react-player";
import { useSelector, useDispatch } from "react-redux";
import { selectAudio, setSeeking, setPlayed } from "@/lib/slices/audioSlice";

type Props = {
  className: string;
  playerRef: React.RefObject<ReactPlayer>;
  hideNumber?: boolean;
};

const convertToMinutes = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds - minutes * 60;
  if (isNaN(minutes) || isNaN(remainingSeconds)) return "0:00";
  return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${Math.floor(
    remainingSeconds
  )}`;
};

function PlayerRange({ className, playerRef, hideNumber }: Props) {
  const { duration, played, playedSeconds } = useSelector(selectAudio);

  const dispatch = useDispatch();
  const handleSeekMouseDown = () => {
    dispatch(setSeeking(true));
  };
  const handleSeekMouseUp = () => {
    dispatch(setSeeking(false));
    playerRef.current?.seekTo(parseFloat(played.toString()));
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setPlayed(parseFloat(e.target.value)));
  };

  return (
    <label
      className={`flex items-center gap-2 text-xs text-neutral-content ${className}`}
    >
      {!hideNumber && <div className="">{convertToMinutes(playedSeconds)}</div>}

      <input
        type="range"
        className="range range-primary range-xs h-1 w-full focus:shadow-none focus:outline-none focus:ring-0"
        max={1}
        value={played}
        step="any"
        onChange={handleSeekChange}
        onMouseDown={handleSeekMouseDown}
        onMouseUp={handleSeekMouseUp}
      />
      {!hideNumber && <div className="">{convertToMinutes(duration)}</div>}
    </label>
  );
}
export default PlayerRange;
