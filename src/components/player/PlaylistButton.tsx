import { ListBulletIcon, PlayIcon, PauseIcon } from "@heroicons/react/24/solid";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Menu } from "@headlessui/react";
import { usePlayerProvider } from "@/components/player/Provider";
import Typography from "@/components/typography";
import type { IPlaylistItem } from "@/utils/types";
import Link from "next/link";
import { routes } from "@/utils/constants";
import React from "react";
import Button from "@/components/buttons/Button";
import TokenLikes from "@/components/likes-plays/TokenLikes";
import { getCreatorNames } from "@/utils/helpers";
import ImageDisplay from "@/components/imageDisplay/ImageDisplay";

// eslint-disable-next-line react/display-name
const PlaylistItem = React.forwardRef<HTMLDivElement, IPlaylistItem>(
  ({ track, active, currentTrack }, ref) => {
    const { setIsPlaying, isPlaying, setCurrentToken } = usePlayerProvider();
    const handlePlayPause = () => {
      if (currentTrack?.id === track?.id) {
        setIsPlaying(!isPlaying);
      }
      if (currentTrack?.id !== track?.id) {
        setCurrentToken(track);
        setIsPlaying(true);
      }
    };
    const isPlayingThis = currentTrack && currentTrack?.id === track?.id;

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
          <div className="relative cursor-pointer" onClick={handlePlayPause}>
            <ImageDisplay
              url={track?.lossyArtworkURL}
              hash={track?.lossyArtworkIPFSHash}
              width={40}
              quality={50}
              alt={track?.title || "Track"}
              className="block w-full rounded-md md:w-72 "
              imgTagClassName="w-10 block rounded-md "
            />
            <div
              className={` absolute left-1 top-[6px] mx-auto rounded-full bg-primary p-2 hover:bg-primary-focus  ${
                isPlayingThis || active ? "block" : "hidden hover:block"
              } `}
            >
              {isPlaying ? (
                <PauseIcon className="h-3 w-3 text-white" />
              ) : (
                <PlayIcon className="h-3 w-3 text-white" />
              )}
            </div>
          </div>
          <div>
            {track?.tokens?.length && track?.tokens?.length > 0 ? (
              <Link
                href={routes.tokenItemDetails(track?.tokens[0]?.mintAddress)}
              >
                <Typography
                  ref={ref}
                  variant="body2"
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
                      ref={ref}
                      variant="body2"
                      className="cursor-pointer opacity-70 hover:text-primary"
                    >
                      {/* {track?.rawArtists?.name} */}@
                      {creator.walletAddress.slice(0, 3) + " "}
                    </Typography>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* <Typography variant="body2" className="">
                {duration?.minutes}:{duration?.seconds}
            </Typography> */}
          {currentTrack && <TokenLikes track={track || null} hideNumber />}
          {/* hideNumber */}

          {/* <div className="btn btn-square btn-ghost btn-sm hover:bg-inherit">
            <HeartIcon className="w-6 h-6 text-primary" />
          </div> */}
        </div>
      </div>
    );
  }
);

function PlaylistButton() {
  const { currentPlaylist, currentToken } = usePlayerProvider();
  const ref = React.createRef<HTMLDivElement>();
  const [openMenu, setOpenMenu] = React.useState(false);
  const handleOpenMenu = () => {
    setOpenMenu(!openMenu);
  };

  return (
    <div className="">
      <Menu as="div" className="inline-block text-left">
        {({ open }) => (
          <>
            <Button onClick={handleOpenMenu}>
              <ListBulletIcon className="h-6 w-6 text-primary hover:text-primary-focus" />
            </Button>
            {openMenu && (
              <div className="absolute bottom-20  right-0  mt-2 h-[800px] max-h-[80vh] w-screen origin-top-right divide-y divide-gray-100 overflow-auto rounded-md border border-base-300 bg-base-100  ring-1 ring-black ring-opacity-5 focus:outline-none sm:w-2/3 md:w-[573px]">
                {/* bottom-14 shadow-lg */}
                <div className="fixed z-30 flex w-screen items-center justify-between border border-base-300 bg-base-100 px-3 py-2 sm:w-2/3 md:w-[573px]">
                  <Typography variant="h6">
                    {currentPlaylist.PlaylistName}
                  </Typography>
                  <Button onClick={handleOpenMenu}>
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
                            currentTrack={currentToken as any}
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
