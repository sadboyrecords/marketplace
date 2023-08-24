import { ListBulletIcon, PlayIcon, PauseIcon } from "@heroicons/react/24/solid";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Menu } from "@headlessui/react";
import Typography from "@/components/typography";
import type { IPlaylistItem } from "@/utils/types";
import Link from "next/link";
import { routes } from "@/utils/constants";
import React from "react";
import Button from "@/components/buttons/Button";
import GeneralLikes from "@/components/likes-plays/GeneralLikes";
import { getCreatorNames, getTrackUrl } from "@/utils/helpers";
import ImageDisplay from "@/components/imageDisplay/ImageDisplay";
import { selectAudio, setCurrentSong } from "@/lib/slices/audioSlice";
import { useSelector, useDispatch } from "react-redux";

// eslint-disable-next-line react/display-name
const PlaylistItem = React.forwardRef<HTMLDivElement, IPlaylistItem>(
  ({ track, active }, ref) => {
    const dispatch = useDispatch();
    const { currentSong, isPlaying } = useSelector(selectAudio);
    const isPlayingThis = currentSong && currentSong?.id === track?.id;

    const trackUrl = getTrackUrl(track);

    return (
      <div
        ref={ref}
        className={`${
          isPlayingThis
            ? "bg-base-200 opacity-100"
            : "bg-opacity-70 opacity-70  hover:opacity-100"
        } flex items-center justify-between border-base-300 px-4 py-3`}
      >
        <div className="flex items-center space-x-6">
          <div
            className="relative cursor-pointer"
            onClick={() => dispatch(setCurrentSong(track))}
          >
            <div className="relative h-16 w-16">
              <ImageDisplay
                url={track?.lossyArtworkURL || undefined}
                hash={track?.lossyArtworkIPFSHash || null}
                width={40}
                quality={50}
                alt={track?.title || "Track"}
                className="block w-full rounded-md md:w-72 "
                imgTagClassName="w-10 block rounded-md "
                fill
              />
              <div
                className={`absolute  bottom-0 left-0 right-0 top-0 m-auto flex items-center justify-center rounded-full p-2  text-center   ${
                  isPlayingThis || active ? "block" : "!hover:block "
                } `}
              >
                {isPlaying && isPlayingThis ? (
                  <PauseIcon className="h-6 w-6 text-white" />
                ) : (
                  <PlayIcon
                    className={`h-6 w-6 text-white ${
                      isPlayingThis ? "" : "!hover:block hidden"
                    }`}
                  />
                )}
              </div>
            </div>
          </div>
          <div>
            {trackUrl ? (
              <Link href={trackUrl || ""}>
                <Typography
                  size="body-sm"
                  className="cursor-pointer hover:text-primary"
                >
                  {track?.title}
                </Typography>
              </Link>
            ) : (
              track?.title
            )}

            <div className="flex flex-wrap space-x-2">
              {getCreatorNames(track).map((creator) => (
                <div key={creator.walletAddress}>
                  <Link href={routes.userProfile(creator.walletAddress)}>
                    <Typography
                      size="body-sm"
                      className="cursor-pointer opacity-70 hover:text-primary"
                    >
                      @{creator?.name}
                    </Typography>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {currentSong && <GeneralLikes songId={track?.id} hideNumber />}
        </div>
      </div>
    );
  }
);

function PlaylistButton() {
  // const { currentPlaylist, currentSong } = usePlayerProvider();
  const { playlist: currentPlaylist, currentSong } = useSelector(selectAudio);
  const ref = React.createRef<HTMLDivElement>();
  const [openMenu, setOpenMenu] = React.useState(false);
  const handleOpenMenu = () => {
    setOpenMenu(!openMenu);
  };

  return (
    <div className="">
      <Menu as="div" className="inline-block text-left">
        {() => (
          <>
            <Button variant="ghost" onClick={handleOpenMenu}>
              <ListBulletIcon className="h-6 w-6 text-neutral-content hover:text-primary-focus" />
            </Button>
            {openMenu && (
              <div className="absolute bottom-20  right-0  mt-2 h-[800px] max-h-[80vh] w-screen origin-top-right divide-y divide-gray-100 overflow-auto rounded-md border border-base-300 bg-base-100  ring-1 ring-black ring-opacity-5 focus:outline-none sm:w-2/3 md:w-[573px]">
                {/* bottom-14 shadow-lg */}
                <div className="fixed z-30 flex w-screen items-center justify-between border border-base-300 bg-base-100 px-3 py-2 sm:w-2/3 md:w-[573px]">
                  <Typography size="body" className="font-bold tracking-widest">
                    {currentPlaylist?.playlistName}
                  </Typography>
                  <Button variant="ghost" onClick={handleOpenMenu}>
                    <XMarkIcon className="h-6 w-6 text-primary hover:text-primary-focus" />
                  </Button>
                </div>
                <div className="px-3 py-4">
                  <div className="mt-20">
                    {currentPlaylist?.tracks?.map((track) => (
                      <Menu.Item key={track?.id}>
                        {({ active }) => (
                          <PlaylistItem
                            track={track}
                            active={active ? true : false}
                            currentTrack={currentSong || null}
                            ref={ref}
                            // onClick={handlePlayPause}
                          />
                        )}
                      </Menu.Item>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </Menu>
    </div>
  );
}

export default PlaylistButton;
