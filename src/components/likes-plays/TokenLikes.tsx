import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { HeartIcon as HeartIconOutline } from "@heroicons/react/24/outline";
import Button from "@/components/buttons/Button";
import { toast } from "react-toastify";
import { abbreviateNumber } from "@/utils/helpers";
import React, { useState, useEffect } from "react";

// import type { ITrack } from '@spinamp/spinamp-hooks';
import { useWallet } from "@solana/wallet-adapter-react";
import { api } from "@/utils/api";
import Typography from "@/components/typography";
import { usePlayerProvider } from "@/components/player/Provider";
import type { ITrack } from "@/utils/types";

function TokenLikes({
  track,
  hideNumber = false,
  isPrimary = true,
  sideView = false,
  padding = "sm",
}: {
  track: ITrack | any | null;
  hideNumber?: boolean;
  sideView?: boolean;
  isPrimary?: boolean;
  padding?: "none" | "xs" | "sm";
}) {
  const { publicKey } = useWallet();
  const utils = api.useContext();
  const publicKeyString = publicKey?.toBase58() || null;
  const { currentPlaylist, currentToken } = usePlayerProvider();

  const [userHasLiked, setUserHasLiked] = useState<boolean>(false);
  const [likes, setLikes] = useState<number>(0);

  const likeMutation = api.songs.likeUnlikeTrack.useMutation();

  const handleLikeUnlike = async () => {
    if (!publicKey) {
      toast.error("Connect your wallet first");
      return;
    }
    try {
      const newLike = !userHasLiked;
      await likeMutation.mutateAsync({
        isLiked: !userHasLiked,
        trackId: track.id,
        userWallet: publicKey?.toBase58(),
      });
      setUserHasLiked(newLike);
      if (newLike) {
        setLikes(likes + 1);
      } else {
        setLikes(likes - 1);
      }
      // await utils.invalidateQueries(['user.getUser']);
      await utils.user.getUser.invalidate();

      // await utils.invalidateQueries(['user.getUser']);
    } catch (error) {
      console.log({ error });
      toast.error("Sorry something went wrong");
    }
  };
  useEffect(() => {
    const hasLikes = publicKeyString
      ? track?.likes?.filter(
          (l: any) => l.userWallet === publicKeyString && l.isLiked
        ).length > 0
      : false;
    setUserHasLiked(hasLikes);
    const num = Number(abbreviateNumber(track?.likes?.length || 0));
    setLikes(num);
    const findTrackIndex = currentPlaylist.tracks.findIndex(
      (t) => t?.id === track?.id
    );
    if (findTrackIndex > -1) {
      currentPlaylist.tracks[findTrackIndex] = {
        ...track,
      };
    }
  }, [publicKeyString, track]);

  return (
    <>
      <Button
        className={`${
          sideView ? "flex space-x-2" : "flex-col space-y-2"
        } p-1 lg:p-3`}
        onClick={handleLikeUnlike}
        padding={padding}
        size="xs"
      >
        <div className="block h-6 w-6">
          {userHasLiked ? (
            <HeartIconSolid
              className={`h-6 w-6 hover:text-primary-focus ${
                isPrimary ? "text-primary " : "text-base-content"
              }`}
            />
          ) : (
            <HeartIconOutline
              className={`h-6 w-6 hover:text-primary-focus ${
                isPrimary ? "text-primary " : "text-base-content"
              }`}
            />
          )}
        </div>
        {!hideNumber && (
          <Typography
            variant="body2"
            color={isPrimary ? "primary" : "base"}
            className={`block hover:text-primary-focus`}
          >
            {likes}
          </Typography>
        )}
      </Button>
    </>
  );
}

export default TokenLikes;
