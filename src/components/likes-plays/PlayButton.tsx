import React from "react";
import Button from "@/components/buttons/Button";
import { PlayIcon, PauseIcon } from "@heroicons/react/20/solid";
import { useDispatch, useSelector } from "react-redux";
import type { SongType } from "@/utils/types";
import {
  selectCurrentSong,
  setCurrentSong,
  selectIsPlaying,
  setPlaylist,
} from "@/lib/slices/audioSlice";

type Props = {
  song: SongType;
  playlistName?: string;
  tracks?: SongType[];
  disabled?: boolean;
};
function PlayButton({ song, playlistName, tracks, disabled }: Props) {
  // console.log({ song });
  const dispatch = useDispatch();
  const currentSong = useSelector(selectCurrentSong);
  const isPlaying = useSelector(selectIsPlaying);
  // console.log({ currentSong });

  const handlePlay = () => {
    if (tracks && playlistName) {
      dispatch(setPlaylist({ tracks, playlistName, currentTrack: song }));
      dispatch(setCurrentSong(song));
    } else {
      dispatch(setCurrentSong(song));
    }
  };

  return (
    <Button
      variant="ghost"
      className="z-10 px-0 py-1 text-primary-400 hover:scale-110 lg:py-3"
      disabled={disabled}
      onClick={handlePlay}
    >
      {currentSong?.id === song?.id && isPlaying ? (
        <PauseIcon className="h-6 w-6 text-primary hover:text-primary-focus" />
      ) : (
        <PlayIcon
          className={`h-6 w-6 ${
            disabled ? "text-neutral-content" : "text-primary"
          } hover:text-primary-focus" `}
        />
      )}
      {/* <PlayIcon className="h-6 w-6 text-primary hover:text-primary-focus" /> */}
    </Button>
  );
}

export default PlayButton;
