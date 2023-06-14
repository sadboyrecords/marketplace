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
import {
  selectPublicAddress,
  openJoinBattleFansModal,
} from "@/lib/slices/appSlice";
import { api } from "@/utils/api";
import { handleCanPlay } from "@/utils/audioHelpers";

type Props = {
  song: SongType;
  playlistName?: string;
  tracks?: SongType[];
  disabled?: boolean;
};
function PlayButton({ song, playlistName, tracks, disabled }: Props) {
  // console.log({ song });
  const { data: activeBattles } = api.songs.checkCanPlay.useQuery(undefined, {
    staleTime: 1000 * 5,
  });
  const dispatch = useDispatch();
  const currentSong = useSelector(selectCurrentSong);
  const isPlaying = useSelector(selectIsPlaying);
  const publicAddress = useSelector(selectPublicAddress);
  // console.log({ currentSong });

  const handlePlay = () => {
    const canPlay = handleCanPlay({
      song,
      activeBattles,
      publicAddress: publicAddress || "",
    });
    console.log({ canPlay, play: canPlay?.canPlay });
    if (!canPlay.canPlay) {
      dispatch(
        openJoinBattleFansModal({
          supporters: canPlay.supporters,
          artistName: canPlay.artistName,
          collectionName: canPlay.collectionName,
          candymachineId: canPlay.candyId,
          competitorCandyId: canPlay.competitorCandyId,
          // battleName: canPlay.battleName,
        })
      );
      return;
    }
    if (tracks && playlistName) {
      dispatch(setPlaylist({ tracks, playlistName, currentTrack: song }));
      dispatch(setCurrentSong(song));
    } else {
      dispatch(setCurrentSong(song));
    }
  };
  // get current active battles + transactions (only if battle is active)
  // -> if user does not have any then display modal
  // check if user has purchased any of them
  // alternatively only send song if user has purchased it - this way wont make sense because it wont apply to tokens

  return (
    <>
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
    </>
  );
}

export default PlayButton;
