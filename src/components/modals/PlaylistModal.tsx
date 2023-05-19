/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable react/no-unknown-property */
/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { Dialog } from "@headlessui/react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import Typography from "@/components/typography";
import Link from "next/link";
import { routes } from "@/utils/constants";
import { api } from "@/utils/api";
import type { SongType, PlaylistType } from "@/utils/types";

export default function PlaylistModal({
  open,
  handleClose,
  songId,
  songTitle,
}: {
  open: boolean;
  handleClose: () => void;
  songId: string;
  songTitle: string;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");

  // const { publicKey } = useWallet();
  const { data: session } = useSession();
  const { data: playlists, refetch: refetchPlaylists } =
    api.playlist.getPlaylistByUser.useQuery(
      {
        walletAddress: session?.user?.walletAddress || "",
      },
      {
        enabled: !!session?.user?.walletAddress,
      }
    );

  type PlaylistsType = typeof playlists;

  const [filteredPlaylists, setFilteredPlaylists] = useState<PlaylistsType>([]);

  const createPlaylistWithTracks =
    api.playlist.createPlaylistWithTracks.useMutation();
  const addTokenToPlaylistMutation =
    api.playlist.addTrackToPlaylist.useMutation();

  const removeTokenFromPlaylistMutation =
    api.playlist.removeTrackFromPlaylist.useMutation();

  function closeModal() {
    setInternalOpen(false);
    handleClose();
  }

  const handleCreatePlaylist = async () => {
    if (!session?.user?.walletAddress)
      return toast.error("You must connect your wallet to create a playlist");
    const loadId = toast.loading("Creating playlist...");
    try {
      const userPlaylistAmount = playlists?.length || 0;
      const newName = `Playlist #${userPlaylistAmount + 1}`;

      const newPlaylist = await createPlaylistWithTracks.mutateAsync({
        playlistName: newName,
        walletAddress: session?.user?.walletAddress || "",
        trackId: songId,
      });
      toast.update(loadId, {
        type: "success",
        isLoading: false,
        autoClose: 2000,
        render: (
          <div className="">
            <Typography variant="body1">
              Added {songTitle} to
              <Link href={routes.playlistDetail(newPlaylist.id)}>
                <span className="mx-2 text-primary">{newName}</span>
              </Link>
            </Typography>
          </div>
        ),
      });
      // toast.success(
      //   <div className="">
      //     <Typography variant="body1">
      //       Added {songTitle} to
      //       <Link href={routes.playlistDetail(newPlaylist.id)}>
      //         <span className="mx-2 text-primary">{newName}</span>
      //       </Link>
      //     </Typography>
      //   </div>
      // );
      closeModal();
    } catch (error) {
      console.log({ error });
      toast.update(loadId, {
        type: "error",
        isLoading: false,
        autoClose: 2000,
        render: "Something went wrong, we couldn't create your playlist",
      });
      // toast.error("Something went wrong, we couldn't create your playlist");
    }
  };

  const handleAddToPlaylist = async ({
    playlist,
  }: {
    playlist: PlaylistType;
  }) => {
    if (
      playlist.songs?.find?.((track) => {
        return track?.id === songId;
      })
    ) {
      toast.warn("This song is already in this playlist");
      return;
    }
    const toastId = toast.loading("Adding song...");
    try {
      await addTokenToPlaylistMutation.mutateAsync({
        playlistId: playlist?.id,
        trackId: songId,
        walletAddress: session?.user?.walletAddress || "",
      });
      // refetchPlaylists();
      toast.update(toastId, {
        type: "success",
        isLoading: false,
        autoClose: 2000,
        render: (
          <div className="">
            <Typography variant="body1">
              Added {songTitle} to
              <Link href={routes.playlistDetail(playlist.id)}>
                <span className="mx-2 text-primary">{playlist.name}</span>
              </Link>
            </Typography>
          </div>
        ),
      });
      closeModal();
    } catch (error) {
      console.log({ error });
      toast.update(toastId, {
        type: "error",
        isLoading: false,
        autoClose: 2000,
        render: "Something went wrong, we couldn't add your song",
      });
    }
  };

  const handleRemoveTrack = async ({
    playlistId,
    playlistName,
  }: {
    playlistId: string;
    playlistName: string;
  }) => {
    const toastId = toast.loading("Removing song...");
    try {
      if (!playlistId) return;

      await removeTokenFromPlaylistMutation.mutateAsync({
        playlistId,
        trackId: songId,
        walletAddress: session?.user?.walletAddress || "",
      });
      void refetchPlaylists();
      toast.update(toastId, {
        type: "success",
        isLoading: false,
        autoClose: 2000,
        render: (
          <div className="">
            <Typography variant="body1">
              Removed {songTitle} to
              <Link href={routes.playlistDetail(playlistId)}>
                <span className="mx-2 text-primary">{playlistName}</span>
              </Link>
            </Typography>
          </div>
        ),
      });
      closeModal();
    } catch (error) {
      console.log({ error });
      toast.update(toastId, {
        type: "error",
        isLoading: false,
        autoClose: 2000,
        render: "Something went wrong, we couldn't remove your song",
      });
    }
  };

  useEffect(() => {
    if (open) {
      setInternalOpen(true);
    }
  }, [open]);

  useEffect(() => {
    if (searchInput) {
      const filtered = playlists?.filter((playlist) =>
        playlist.name.toLowerCase().includes(searchInput.toLowerCase())
      );
      setFilteredPlaylists(filtered || []);
    } else {
      setFilteredPlaylists(playlists || []);
    }
  }, [searchInput, playlists]);

  return (
    <>
      <Dialog
        as="div"
        open={internalOpen}
        className="relative z-10"
        onClose={closeModal}
      >
        <>
          <div
            className="fixed inset-0 z-10 bg-neutral bg-opacity-25"
            onClick={closeModal}
            aria-hidden="true"
          />
        </>

        <div className="fixed inset-0 z-20 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <>
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-base-100 p-6 text-left align-middle shadow-xl transition-all">
                <div className="mt-2 border-b-2 py-2">
                  <button onClick={handleCreatePlaylist}>
                    <Typography variant="body1" color="primary">
                      Create Playlist
                    </Typography>
                  </button>
                </div>
                <div className="no-scrollbar mt-2 max-h-[12.5rem] overflow-scroll">
                  {filteredPlaylists?.map?.((playlist) => (
                    <div
                      key={playlist?.id}
                      className="flex items-center justify-between py-2"
                    >
                      <div className="flex items-center">
                        <div
                          className=""
                          aria-disabled={playlist.songs?.find?.((track) => {
                            return track.id === songId;
                          })}
                          onClick={() => handleAddToPlaylist({ playlist })}
                        >
                          <Typography
                            variant="body"
                            className={
                              playlist.songs?.find?.((track) => {
                                return track.id === songId;
                              })
                                ? "opacity-50"
                                : "base cursor-pointer"
                            }
                          >
                            {playlist.name}
                          </Typography>
                        </div>
                      </div>
                      <div
                        onClick={() =>
                          handleRemoveTrack({
                            playlistId: playlist.id,
                            playlistName: playlist.name,
                          })
                        }
                      >
                        <Typography
                          variant="body2"
                          color="primary"
                          className={
                            playlist.songs?.find?.((track) => {
                              return track.id === songId;
                            })
                              ? "block cursor-pointer"
                              : "hidden"
                          }
                        >
                          remove
                        </Typography>
                      </div>
                    </div>
                  ))}
                </div>
              </Dialog.Panel>
            </>
          </div>
        </div>
      </Dialog>
    </>
  );
}
