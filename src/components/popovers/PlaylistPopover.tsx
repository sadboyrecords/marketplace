/* eslint-disable @typescript-eslint/no-misused-promises */
import React, { Fragment, useState } from "react";
// import parse from 'html-react-parser';
import { Menu, Transition } from "@headlessui/react";
import PlaylistModal from "@/components/modals/PlaylistModal";
import { api } from "@/utils/api";

import { toast } from "react-toastify";
// import { stripHtml } from 'utils/helpers';
import { EllipsisVerticalIcon } from "@heroicons/react/24/solid";

const PlaylistPopover = ({
  songId,
  // contractAddress,
  // artistSlug,
  songTitle,
  publicKey,
  playlistId,
  showRemove,
  updatePlaylist,
}: {
  songId: string;
  contractAddress?: string;
  artistSlug?: string;
  songTitle: string;
  publicKey?: string;
  playlistId?: string;
  showRemove?: boolean;
  updatePlaylist?: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const addTrackToPlaylistMutation =
    api.playlist.addTrackToPlaylist.useMutation();
  const removeTrackFromPlaylistMutation =
    api.playlist.removeTrackFromPlaylist.useMutation();

  if (playlistId && showRemove) {
    return (
      <button
        onClick={async () => {
          try {
            await removeTrackFromPlaylistMutation.mutateAsync({
              playlistId: playlistId || "",
              trackId: songId,
            });
            updatePlaylist?.();
          } catch (error) {
            toast.error("Couldn't remove track from playlist");
          }
        }}
      >
        -
      </button>
    );
  } else if (playlistId) {
    return (
      <button
        onClick={async () => {
          try {
            await addTrackToPlaylistMutation.mutateAsync({
              playlistId: playlistId || "",
              trackId: songId,
            });
            updatePlaylist?.();
          } catch (error) {
            toast.error("Couldn't add track to playlist");
          }
        }}
      >
        +
      </button>
    );
  }

  const handleAddToPlaylist = async () => {
    if (playlistId) {
      try {
        toast.loading("Adding to playlist...");
        await addTrackToPlaylistMutation.mutateAsync({
          playlistId,
          trackId: songId,
        });
        toast.dismiss();
        updatePlaylist?.();
        toast.success("Track added to playlist");
      } catch (error) {
        toast.dismiss();
        toast.error("Couldn't add track to playlist");
      }
    } else {
      setIsOpen(true);
    }
  };

  return (
    <>
      <PlaylistModal
        open={isOpen}
        handleClose={() => setIsOpen(false)}
        songId={songId}
        songTitle={songTitle}
      />
      <Menu as="div" className="relative inline-block text-left">
        {({ open }) => (
          <>
            <div>
              <Menu.Button className="">
                {/* <IconButton size="xs" className="p-0"> */}
                <EllipsisVerticalIcon className="h-5 w-5" />
                {/* </IconButton> */}
              </Menu.Button>
            </div>
            {open && !isOpen && (
              <>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 z-20 mt-2 w-56 origin-top-right rounded-md border  border-base-300 bg-base-100 shadow-lg">
                    <div className="px-1 py-1 ">
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            className={`${
                              active ? "text-primary" : "text-base-content"
                            } group flex w-full items-center rounded-md px-4 py-4 text-sm
                                                          `}
                            onClick={handleAddToPlaylist}
                            // disabled={!publicKey}
                            onBlur={() => setIsOpen(false)}
                          >
                            Add to Playlist
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                    {/* <div className="px-1 py-1">
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            className={`${
                              active ? 'text-primary' : 'text-base-content'
                            } group flex w-full items-center rounded-md px-4 py-4 text-sm`}
                          >
                            <Link href={`/tokens/${contractAddress}`}>
                              View Collection
                            </Link>
                          </button>
                        )}
                      </Menu.Item>
                    </div> */}
                  </Menu.Items>
                </Transition>
              </>
            )}
          </>
        )}
      </Menu>
    </>
  );
};

export default PlaylistPopover;
