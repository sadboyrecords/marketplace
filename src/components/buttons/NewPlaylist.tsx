import React, { useState } from "react";
import Button from "@/components/buttons/Button";
import { api } from "@/utils/api";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { routes } from "@/utils/constants";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import { useSession } from "next-auth/react";

function NewPlaylistButton({ isNav }: { isNav?: boolean }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const { data: playlists } = api.playlist.getPlaylistByUser.useQuery(
    {
      walletAddress: session?.user?.walletAddress || "",
    },
    {
      enabled: !!session?.user?.walletAddress,
    }
  );
  const createPlaylist = api.playlist.createPlaylist.useMutation();

  const handleCreatePlaylist = async () => {
    try {
      if (!session?.user?.walletAddress) {
        toast.warn("Sign in first");
        return;
      }
      setIsCreating(true);
      const userPlaylistAmount = playlists?.length || 0;
      const newName = `Playlist #${userPlaylistAmount + 1}`;

      const playlist = await createPlaylist.mutateAsync({
        playlistName: newName,
        walletAddress: session?.user?.walletAddress,
      });
      void router.push(routes.playlistDetail(playlist.id) + "?isCurated=true");
      setIsCreating(false);
    } catch (error) {
      console.log({ error });
      toast.error("Something went wrong");
      setIsCreating(false);
    }
  };
  return (
    <div>
      <Button
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onClick={handleCreatePlaylist}
        // variant="outlined"
        size="sm"
        loading={isCreating}
        className={`${isNav ? "md:bg-transparent xl:bg-primary" : ""} "`}
      >
        <PlusCircleIcon
          className={`${isNav ? "md:text-primary xl:text-white" : ""} h-7 w-7`}
        />
        <span className={`${isNav ? "block md:hidden xl:block" : ""} ml-2`}>
          Create Playlist
        </span>
      </Button>
    </div>
  );
}

export default NewPlaylistButton;
