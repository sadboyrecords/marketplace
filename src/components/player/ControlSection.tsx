import React from "react";
import PlayPauseButton from "./PlayPauseButton";
import Icon from "@/components/icons";
import PlayerRange from "./Range";
import { AVAILABLE_PLAYBACK_STATES } from "./constants";
import {
  pause,
  play,
  selectIsPlaying,
  setNext,
  setPrev,
  selectAudio,
  setShuffle,
  setLoop,
} from "@/lib/slices/audioSlice";
import { useSelector, useDispatch } from "react-redux";
import type ReactPlayer from "react-player";

type Props = {
  playerRef: React.RefObject<ReactPlayer>;
};

function ControlSection({ playerRef }: Props) {
  const dispatch = useDispatch();
  const isPlaying = useSelector(selectIsPlaying);
  const { shuffle, loop } = useSelector(selectAudio);

  const handlePlayPause = () => {
    if (isPlaying) {
      dispatch(pause());
    }
    if (!isPlaying) {
      dispatch(play());
    }
  };

  const handlePrevious = () => {
    dispatch(setPrev());
    playerRef.current?.seekTo(parseFloat("0"));
  };
  const handleNext = () => {
    dispatch(setNext());
    playerRef.current?.seekTo(parseFloat("0"));
  };

  return (
    <div className="min-w-[150px] justify-center sm:mx-10 lg:min-w-[12.5rem]">
      <div className="flex  items-center  justify-center space-x-6 text-base-content">
        <div className="hidden items-center sm:flex ">
          <PlayPauseButton onClick={() => dispatch(setShuffle())}>
            <Icon
              name="SHUFFLE"
              className={`h-5 w-5 ${shuffle ? "text-primary-500" : ""}`}
            />
          </PlayPauseButton>
        </div>

        <PlayPauseButton onClick={handlePrevious}>
          <Icon name="BACKWARD" className="h-5 w-5" />
        </PlayPauseButton>
        <PlayPauseButton className="text-center" onClick={handlePlayPause}>
          {isPlaying ? (
            <Icon name="PAUSE" className="h-8 w-8 " />
          ) : (
            <Icon name="PLAY" className="h-8 w-8 " />
          )}
        </PlayPauseButton>
        <PlayPauseButton onClick={handleNext}>
          <Icon name="FORWARD" className="h-5 w-5" />
        </PlayPauseButton>
        <div className="hidden  items-center sm:flex ">
          <PlayPauseButton onClick={() => dispatch(setLoop())}>
            <Icon
              name="REPEAT"
              className={`h-5 w-5 ${loop ? "text-primary-500" : ""}`}
            />
          </PlayPauseButton>
        </div>

        {/* <div
          className="hidden h-7 w-7 sm:flex"
          // tooltip
          // data-tip={playbackState}
        > */}
        {/* <PlayPauseButton onClick={handleShuffle}>
            {playbackState === AVAILABLE_PLAYBACK_STATES.PLAY_ALL && (
              <Icon name="SHUFFLE" className="block h-5 w-5 text-gray-600" />
            )}
            {playbackState === AVAILABLE_PLAYBACK_STATES.REPEAT_ALL && (
              <Icon name="SHUFFLE" className="block h-5 w-5 text-primary" />
            )}
            {playbackState === AVAILABLE_PLAYBACK_STATES.REPEAT_ONE && (
              <Icon
                name="SHUFFLE_ONCE"
                className="block h-6 w-6 text-primary"
              />
            )} */}
        {/* </PlayPauseButton> */}
        {/* </div> */}
      </div>
    </div>
  );
}

export default ControlSection;
