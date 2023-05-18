/* eslint-disable @typescript-eslint/no-misused-promises */
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { api } from "@/utils/api";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { HeartIcon as HeartIconOutline } from "@heroicons/react/24/outline";
import Typography from "@/components/typography";
import { Pencil } from "@/components/iconComponents";
// import { usePlayerProvider } from '@/components/Player/Provider';
import { toast } from "react-toastify";
import TrackItem from "@/components/track/TrackItem";
import { routes } from "@/utils/constants";
import Button from "@/components/buttons/Button";
import PlayButton from "@/components/likes-plays/PlayButton";
import type { SongType } from "@/utils/types";
import PlaylistCard from "@/components/playlist/PlaylistCard";
import Input from "@/components/formFields/Input";
import TextArea from "@/components/formFields/TextArea";
import { useForm } from "react-hook-form";
import { useSession } from "next-auth/react";

type FormData = {
  name: string;
  description: string;
};

function PlaylistDetails() {
  const { register, handleSubmit, setValue } = useForm<FormData>();

  const router = useRouter();
  const query = router.query;
  const { isCurated } = query;
  const playlistId = query.playlistId as string;
  const [toasted, setToasted] = useState(false);
  const [editing, setEditing] = useState(false);
  // const [isPublic, setIsPublic] = useState(false);
  const [playlistName, setPlaylistName] = useState("");
  const [playlistDescription, setPlaylistDescription] = useState("");
  // const [imageList, setImageList] = useState<any>([]);
  const [isLiked, setIsLiked] = useState(false);
  const [suggestedSongs, setSuggestedSongs] = useState<SongType[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const deleteMutation = api.playlist.deletePlaylist.useMutation();
  // const { setCurrentPlaylist, currentPlaylist, isPlaying, setIsPlaying } =
  //   usePlayerProvider();
  const playlistPublicMutation =
    api.playlist.updatePrivatePublicPlaylist.useMutation();
  const likePlaylistMutation = api.playlist.likeUnlikePlaylist.useMutation();
  // const { publicKey } = useWallet();
  const { data: session } = useSession();
  const userData = api.user.getUser.useQuery(
    { publicKey: session?.user?.walletAddress || "" },
    {
      enabled: !!session?.user?.walletAddress,
    }
  );

  const updatePlaylistMutation = api.playlist.updatePlaylist.useMutation();
  const {
    data: playlist,
    refetch,
    isLoading,
  } = api.playlist.byId.useQuery(
    {
      playlistId: playlistId || "",
      currentUserAddress: session?.user?.walletAddress,
    },
    {
      enabled: !!playlistId,
    }
  );

  const songsQuery = api.songs.getSuggestedSongs.useInfiniteQuery(
    { limit: 10, skipIds: playlist?.songs.map((song) => song.id) || [] },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      enabled: !!playlistId,
    }
  );

  const [isLiking, setIsLiking] = useState(false);
  const handleLikeUnlikePlaylist = async () => {
    try {
      setIsLiking(true);
      await likePlaylistMutation.mutateAsync({
        playlistId: playlist?.id || "",
        walletAddress: session?.user?.walletAddress || "",
        isLiked: !isLiked,
      });

      await refetch();
      await userData.refetch();
      setIsLiked(!isLiked);
      setIsLiking(false);
      toast.success(isLiked ? "Unliked Playlist" : "Liked Playlist");
    } catch (e) {
      toast.error("Couldn't Like Playlist");
    }
  };

  // useEffect(() => {
  //   if (playlist) {
  //     setIsPublic(playlist.isPublic);
  //   }
  // }, [playlist]);

  // const handlePlay = () => {
  //   setCurrentPlaylist({
  //     tracks: (playlist?.songs as any[]) || [],
  //     PlaylistName: playlist?.name,
  //   });
  //   setIsPlaying(true);
  // };

  // const handlePause = () => {
  //   setIsPlaying(false);
  // };
  const handleDeletePlaylist = async () => {
    try {
      setIsDeleting(true);
      await deleteMutation.mutateAsync({
        playlistId: playlistId,
        walletAddress: session?.user?.walletAddress || "",
      });
      toast.success("Playlist deleted");

      void router.push(
        session ? routes.userProfile(session?.user?.walletAddress || "") : "/"
      );
    } catch (e) {
      toast.error("Couldn't delete playlist");
      setIsDeleting(false);
    }
  };

  const handleSave = async (data: FormData) => {
    try {
      if (!playlist) {
        return;
      }
      setIsUpdating(true);
      await updatePlaylistMutation.mutateAsync({
        playlistId: playlist?.id,
        playlistName: data?.name,
        walletAddress: session?.user?.walletAddress || "",
        playlistDescription: data?.description,
      });
      await refetch();
      setEditing(false);
      setIsUpdating(false);
    } catch (e) {
      await refetch();
      setIsUpdating(false);
      toast.error("Sign In First");
    }
  };

  const handleSetpublic = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // setIsPublic(e.target.checked);
    console.log({ public: e.target.checked });
    const res = await playlistPublicMutation.mutateAsync({
      walletAddress: session?.user?.walletAddress || "",
      playlistId: playlist?.id || "",
      isPublic: e.target.checked,
    });
    await refetch();
    console.log({ public2: e.target.checked });

    toast.success(`Playlist is now ${res?.isPublic ? "public" : "private"}`);
  };

  useEffect(() => {
    if (!playlist?.songs && isCurated && !toasted) {
      toast.success(
        "Playlist Created. Add tracks and publish it to make it public"
      );
      if (playlistId) {
        void router.replace(`/playlist/${playlistId}`, undefined, {
          shallow: true,
        });
      }
    }
  }, [isCurated, playlist?.songs, playlistId, router, toasted]);

  useEffect(() => {
    const liked = userData?.data?.likedPlaylists?.find?.(
      (like) => like?.playlistId === playlistId
    );
    if (liked) {
      setIsLiked(true);
    }
  }, [playlistId, userData?.data?.likedPlaylists]);

  useMemo(() => {
    const songUpdates: SongType[] = [];
    songsQuery &&
      songsQuery?.data?.pages.forEach((page) => {
        page.songs.forEach((song) => {
          songUpdates.push(song);
        });
      });
    setSuggestedSongs(songUpdates);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [songsQuery?.data?.pages]);

  useEffect(() => {
    if (playlist) {
      setValue("name", playlist.name);
      setValue("description", playlist.description || "");
    }
  }, [playlist, setValue]);

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        {/* flex  w-full md:flex-row */}
        <div className="flex justify-center md:justify-start">
          {isLoading && (
            <div className="h-[18rem] w-full animate-pulse rounded-lg bg-gray-neutral/50" />
          )}
          {playlist && (
            <PlaylistCard
              playlist={playlist}
              songs={playlist.songs}
              hideBottom
              fullWidth
            />
          )}
        </div>
        <div className="flex  flex-1 flex-col space-y-3  ">
          {!editing && playlist && (
            <Typography type="h1" size="display-md">
              {playlist?.name}
            </Typography>
          )}
          {isLoading && (
            <div className="h-10 w-32 animate-pulse bg-gray-neutral/50" />
          )}
          <div className="flex w-full flex-row justify-between align-middle ">
            {/* pencil icon button */}
            {playlist?.creator?.isCreator && (
              <div className="flex items-center space-x-3">
                <Typography>Public</Typography>
                <input
                  type="checkbox"
                  className="toggle toggle-sm text-base-content"
                  checked={playlist?.isPublic}
                  onChange={handleSetpublic}
                />
              </div>
            )}
            {playlist?.creator?.isCreator && !editing && (
              <button
                onClick={() => {
                  setEditing(!editing);
                  setPlaylistName(playlist?.name);
                  setPlaylistDescription(playlist?.description || "");
                  // setIsPublic(playlist?.isPublic);
                }}
              >
                <Pencil />
              </button>
            )}
          </div>
          <div className="mb-2  w-full">
            {!editing ? (
              <>
                {playlist && (
                  <Typography color="neutral-gray" size="body-sm">
                    {playlist?.description || ""}
                  </Typography>
                )}
              </>
            ) : (
              <form
                className="flex flex-col space-y-4"
                onSubmit={handleSubmit(handleSave)}
              >
                <Input
                  label="Playlist Name"
                  inputProps={{
                    ...register("name", {}),
                  }}
                />
                <TextArea
                  label="Description"
                  rows={5}
                  inputProps={{
                    ...register("description", {}),
                  }}
                />
                <div className="mt-4 space-x-6">
                  <Button type="submit" loading={isUpdating}>
                    Save
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setEditing(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    loading={isDeleting}
                    variant="ghost"
                    onClick={handleDeletePlaylist}
                  >
                    Delete
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
      {playlist && (
        <div className="border-b-2 border-border-gray pb-4 ">
          <div className="grid grid-cols-3 items-center justify-items-start gap-4 align-middle">
            <PlayButton
              playlistName={playlist.name}
              tracks={playlist?.songs}
              song={playlist?.songs[0] as SongType}
              disabled={playlist?.songs.length === 0}
            />
            <div className="col-span-1">
              <span className="mr-2 font-bold">{playlist?.songs?.length}</span>{" "}
              tracks
            </div>
            <div className="col-span-1 flex items-center align-middle">
              <span className="mr-2 mt-0 font-bold">
                {playlist?.likes?.length}
              </span>{" "}
              <button onClick={handleLikeUnlikePlaylist}>
                {isLiked ? (
                  <HeartIconSolid
                    className={`h-6 w-6 ${
                      isLiking ? "animate-ping" : ""
                    } text-primary hover:text-primary-focus`}
                  />
                ) : (
                  <HeartIconOutline
                    className={`h-6 w-6 text-primary hover:text-primary-focus ${
                      isLiking ? "animate-ping" : ""
                    }`}
                  />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* PLAYLIST SONGS */}
      <div>
        {playlist?.songs?.map((track) => (
          <div key={track.id} className="flex flex-col">
            <TrackItem
              playlistName={playlist.name}
              track={track}
              playlistTracks={playlist?.songs}
              playlistId={playlist?.id}
              isCreator={playlist?.creator?.isCreator}
              refreshPlaylist={refetch}
            />
          </div>
        ))}
      </div>

      {playlist?.creator?.isCreator && (
        <div className="">
          <Typography size="display-xs" className="mb-6">
            Add Tracks to Playlist
          </Typography>
          {suggestedSongs?.map((track) => (
            <div key={track?.id}>
              <TrackItem
                playlistName=""
                // playlistTracks={suggestedSongs}
                track={track}
                canAdd
                playlistId={playlist?.id}
                refreshPlaylist={refetch}
                isCreator={playlist?.creator?.isCreator}
              />
            </div>
          ))}
          {/* <TokenCardGrid
            tracks={data?.topNfts || []}
            playlistId={playlist.id}
            playlistTracks={playlist.songs}
            updatePlaylist={refetch}
            hideDuplicate
          /> */}
        </div>
      )}
    </div>
  );
}

export default PlaylistDetails;
