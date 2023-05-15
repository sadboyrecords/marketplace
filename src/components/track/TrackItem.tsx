/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-misused-promises */

import Link from "next/link";
import Typography from "@/components/typography";
import { PlayIcon, PauseIcon } from "@heroicons/react/24/solid";
import { routes } from "@/utils/constants";
import { TrashIcon, PlusIcon } from "@heroicons/react/24/outline";
import { getCreatorNames, getTrackUrl } from "@/utils/helpers";
import { useEffect, useState } from "react";
import PlaylistPopover from "@/components/popovers/PlaylistPopover";
import Button from "@/components/buttons/Button";
import ImageDisplay from "@/components/imageDisplay/ImageDisplay";
import type { SongType } from "@/utils/types";
import GeneralLikes from "../likes-plays/GeneralLikes";
import { useSelector, useDispatch } from "react-redux";
import {
  selectAudio,
  setCurrentSong,
  setPlaylist,
} from "@/lib/slices/audioSlice";
import { api } from "@/utils/api";
import { toast } from "react-toastify";

function TrackItem({
  track,
  playlistTracks,
  playlistName,
  playlistId,
  isCreator,
  refreshPlaylist,
  showPopover,
  userPublicKey,
  canAdd,
}: {
  playlistName?: string;
  track: SongType;
  playlistTracks?: SongType[];
  playlistId?: string;
  isCreator?: boolean;
  showPopover?: boolean;
  userPublicKey?: string;
  canAdd?: boolean;
  refreshPlaylist?: () => void; //;Promise<void>
}) {
  const { currentSong, isPlaying } = useSelector(selectAudio);
  const dispatch = useDispatch();

  const handlePlay = () => {
    if (playlistTracks && playlistName) {
      dispatch(
        setPlaylist({
          tracks: playlistTracks,
          playlistName,
          currentTrack: track,
        })
      );
      dispatch(setCurrentSong(track));
    } else {
      dispatch(setCurrentSong(track));
    }
  };

  const songAdd = api.playlist.addTrackToPlaylist.useMutation();
  const util = api.useContext();

  const [isLoading, setIsLoading] = useState(false);

  const handleAddToPlaylist = async () => {
    setIsLoading(true);
    if (!playlistId || !track) return;
    try {
      await songAdd.mutateAsync({
        playlistId,
        trackId: track?.id,
      });
      await util.playlist.byId.refetch({ playlistId: playlistId });
      setIsLoading(false);
    } catch (error) {
      toast.error("Something went wrong");
      setIsLoading(false);
    }
  };

  const songRemove = api.playlist.removeTrackFromPlaylist.useMutation();

  const handleRemoveFromPlaylist = async () => {
    setIsLoading(true);
    if (!playlistId || !track) return;
    try {
      await songRemove.mutateAsync({
        playlistId,
        trackId: track?.id,
      });
      await util.playlist.byId.refetch({ playlistId: playlistId });
      setIsLoading(false);
    } catch (error) {
      toast.error("Something went wrong");
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-8 border-b border-base-300 px-4 py-6`}
    >
      <div className="flex flex-1 items-center space-x-6">
        {/* Image */}
        <div className="flex  items-center gap-2">
          {/* <button
            className="flex cursor-pointer flex-row justify-center space-x-8"
            onClick={handlePlayPause}
            disabled={disablePlay}
            // disabled={true}
          >
            <div
              className={`${"bg-neutral hover:bg-primary-focus"}  self-center rounded-full  p-2`}
            >
              {disablePlay ? (
                <LoadingSpinner className="h-3 w-3 text-white" />
              ) : (
                <>
                  {isPlaying && isPlayingThis ? (
                    <PauseIcon className="h-3 w-3 text-white" />
                  ) : (
                    <PlayIcon
                      className={`h-3 w-3 ${
                        disablePlay ? "text-gray-600" : "text-white"
                      }`}
                    />
                  )}
                </>
              )}
            </div>
          </button> */}
          {/* Image play */}
          <div
            className="group relative h-24 w-24 cursor-pointer rounded-xl "
            onClick={handlePlay}
          >
            <ImageDisplay
              url={track?.lossyArtworkURL || undefined}
              hash={track?.lossyArtworkIPFSHash || null} //track?.lossyArtworkIPFSHash
              // width={track?.pinnedImage?.width || 100}
              // height={track?.pinnedImage?.height || 100}
              width={100}
              height={100}
              path={track?.pinnedImage?.path}
              pinnedStatus={track?.pinnedImage?.status}
              resizeWidth={100}
              quality={50}
              alt={track?.title || "Track"}
              fill
              sizes="5vw"
              className={`h-full w-full  rounded-md  object-cover group-hover:brightness-50 ${
                currentSong?.id === track?.id ? "brightness-50" : ""
              } `}
              imgTagClassName="!w-[100px] !h-[100px]  rounded-md "
            />
            {currentSong?.id === track?.id && (
              <div className="absolute bottom-0 left-0 right-0 top-0 m-auto flex items-center justify-center text-center">
                {isPlaying ? (
                  <PauseIcon className="h-10 w-10 text-gray-200" />
                ) : (
                  <PlayIcon className="h-10 w-10 text-gray-200" />
                )}
              </div>
            )}
            {currentSong?.id !== track?.id && (
              <div className="invisible absolute bottom-0 left-0 right-0 top-0 m-auto flex items-center justify-center text-center group-hover:visible">
                <PlayIcon className="h-10 w-10 text-gray-200" />
              </div>
            )}
          </div>
        </div>
        {/* track title + artist names */}
        <div className=" min-w-[10rem] flex-1 ">
          {getTrackUrl(track) ? (
            <Link href={getTrackUrl(track) || ""}>
              <Typography
                // ref={ref}
                size="body"
                className="cursor-pointer hover:text-primary"
              >
                {track?.title.slice(0, 20)}
              </Typography>
            </Link>
          ) : (
            <Typography className="truncate">{track?.title}</Typography>
          )}

          {getCreatorNames(track).map((c) => (
            <Typography
              size="body-sm"
              className="cursor-pointer opacity-70 hover:text-primary"
              key={c.walletAddress}
            >
              <Link href={routes.userProfile(c.walletAddress)}>@{c.name}</Link>
            </Typography>
          ))}
        </div>
      </div>
      {/* like + add button  */}
      <div className="flex items-center">
        <GeneralLikes songId={track?.id} hideNumber />
        {isCreator &&
          !!playlistTracks?.find((t) => {
            return t?.id === track?.id;
          }) && (
            <>
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  onClick={handleRemoveFromPlaylist}
                  loading={isLoading}
                >
                  {isLoading ? (
                    ""
                  ) : (
                    <TrashIcon className="h-4 w-4 text-primary opacity-75" />
                  )}
                </Button>
              </div>
            </>
          )}
        {canAdd && (
          <Button
            variant="ghost"
            onClick={handleAddToPlaylist}
            loading={isLoading}
          >
            {isLoading ? (
              ""
            ) : (
              <PlusIcon className="h-5 w-5 text-neutral-content" />
            )}
          </Button>
        )}
        {showPopover && (
          <PlaylistPopover
            publicKey={userPublicKey}
            songId={track?.id || " "}
            songTitle={track?.title || " "}
            playlistId={playlistId}
          />
        )}
      </div>
    </div>
  );
}

function LoaderCard() {
  // { className }
  return (
    <div
      className={`flex animate-pulse items-center justify-between border-b border-base-300 px-4 py-3 `}
    >
      <div className="flex items-center space-x-6">
        <div className="flex cursor-pointer flex-row justify-center space-x-8">
          <div>
            <div className="block h-20 w-20 rounded-md bg-base-300" />
          </div>
          <div>
            <div className="h-3 w-24 bg-base-300"></div>
            <div className="mt-2 h-3 w-12 bg-base-300"></div>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <div className="h-8 w-8  bg-base-300"></div>
      </div>
    </div>
  );
}

TrackItem.loader = <LoaderCard />;
export default TrackItem;
