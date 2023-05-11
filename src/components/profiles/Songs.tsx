import MarginLayout from "@/components/layouts/MarginLayout";
import Typography from "@/components/typography";
import { api } from "@/utils/api";
import TrackItem from "@/components/track/TrackItem";
import { useState, useMemo } from "react";

type Props = {
  walletAddress: string | undefined;
};

function UserSongs({ walletAddress }: Props) {
  const { data: songs, isLoading } = api.user.getUserSongs.useQuery(
    {
      walletAddress: walletAddress || "",
    },
    {
      enabled: !!walletAddress,
    }
  );
  const { data: likedSongs, isLoading: isLoadingLiked } =
    api.user.getLikedSongs.useQuery(
      {
        walletAddress: walletAddress || "",
      },
      {
        enabled: !!walletAddress,
      }
    );

  const [buttonState, setButtonState] = useState<"LIKED" | "CREATED">();

  useMemo(() => {
    if (songs && songs?.length > 0) {
      setButtonState("CREATED");
      return;
    }
    if (likedSongs && likedSongs?.length > 0) {
      setButtonState("LIKED");
      return;
    }
  }, [likedSongs, songs]);

  if (isLoading)
    return (
      <MarginLayout>
        <div className=" h-4 w-32 animate-pulse bg-slate-500/30" />
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2">
          {TrackItem.loader}
          {TrackItem.loader}
          {TrackItem.loader}
          {TrackItem.loader}
        </div>
      </MarginLayout>
    );

  if (!songs?.length && songs?.length === 0 && likedSongs?.length === 0)
    return null;

  return (
    <MarginLayout>
      <Typography className="font-bold tracking-wider" size="display-xs">
        Songs
      </Typography>
      <div className="mt-2 flex space-x-5">
        <span
          className={`inline-flex cursor-pointer items-center rounded-md ${
            buttonState === "CREATED"
              ? "bg-primary-400 text-white hover:bg-primary-700"
              : "bg-border-gray text-neutral-content hover:bg-border-gray/60"
          } px-2 py-1 text-xs font-medium ring-1 ring-inset ring-gray-500/10`}
          onClick={() => setButtonState("CREATED")}
        >
          Released
        </span>
        <span
          className={`inline-flex cursor-pointer items-center rounded-md ${
            buttonState === "LIKED"
              ? "bg-primary-400 text-white hover:bg-primary-700"
              : "bg-border-gray text-neutral-content hover:bg-border-gray/60"
          } px-2 py-1 text-xs font-medium ring-1 ring-inset ring-gray-500/10`}
          onClick={() => setButtonState("LIKED")}
        >
          Liked
        </span>
      </div>

      <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-2">
        {buttonState === "CREATED" && (
          <>
            {songs?.map((song) => (
              <TrackItem key={song?.id} track={song} />
            ))}
          </>
        )}
        {buttonState === "LIKED" && (
          <>
            {likedSongs?.map((song) => (
              <TrackItem key={song?.id} track={song} />
            ))}
          </>
        )}
      </div>
    </MarginLayout>
  );
}

export default UserSongs;
