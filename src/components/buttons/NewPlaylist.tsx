import React, { useState } from "react";
import Button from "@/components/buttons/Button";
import { api } from "@/utils/api";
import { useWallet } from "@solana/wallet-adapter-react";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { routes } from "@/utils/constants";
import { PlusCircleIcon } from "@heroicons/react/24/outline";

function NewPlaylistButton({ isNav }: { isNav?: boolean }) {
  const { publicKey } = useWallet();
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const { data: playlists } = api.playlist.getPlaylistByUser.useQuery(
    {
      walletAddress: publicKey?.toBase58() || "",
    },
    {
      enabled: !!publicKey,
    }
  );
  const createPlaylist = api.playlist.createPlaylist.useMutation();

  const handleCreatePlaylist = async () => {
    try {
      if (!publicKey) {
        toast.warn("Sign in first");
        return;
      }
      setIsCreating(true);
      const userPlaylistAmount = playlists?.length || 0;
      const newName = `Playlist #${userPlaylistAmount + 1}`;

      const playlist = await createPlaylist.mutateAsync({
        playlistName: newName,
        walletAddress: publicKey?.toBase58(),
      });
      void router.push(routes.playlistDetail(playlist.id) + "?isCurated=true");
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
