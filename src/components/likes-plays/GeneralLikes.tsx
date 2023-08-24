import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { HeartIcon as HeartIconOutline } from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
// import { abbreviateNumber } from "@/utils/helpers";
import { api } from "@/utils/api";
import Typography from "@/components/typography";
import Button from "@/components/buttons/Button";
import { useState } from "react";
import { useSession } from "next-auth/react";

function GeneralLikes({
  hideNumber = false,
  isPrimary = true,
  sideView = false,
  candyMachineId,
  songId,
}: {
  candyMachineId?: string;
  songId?: string;
  hideNumber?: boolean;
  sideView?: boolean;
  isPrimary?: boolean;
  padding?: "none" | "xs" | "sm";
}) {
  const likeMutation = api.likes.likeSong.useMutation();
  const { data: songLikes, refetch } = api.likes.getLikesBySongId.useQuery(
    {
      songId: songId || "",
    },
    {
      enabled: !!songId,
      staleTime: 4000,
    }
  );

  const [liking, setLiking] = useState(false);
  const { data: session } = useSession();

  const userHasLiked = songLikes?.find(
    (l) => l.userWallet === session?.user?.walletAddress
  );

  const handleLikeUnlike = async () => {
    if (!session) {
      toast.warn("Please sign in.");
      return;
    }
    if (!songId) {
      toast.error("There is an error");
      return;
    }
    try {
      setLiking(true);
      await likeMutation.mutateAsync({
        songId,
        isLiked: !userHasLiked,
        candyId: candyMachineId,
      });
      await refetch();
      setLiking(false);
    } catch (error) {
      setLiking(false);
      toast.error("Sorry something went wrong");
    }
  };
  // const utils = api.useContext();
  // const publicKeyString = publicKey?.toBase58() || null;

  //   const { data: userLikes } = api.candyMachine.getLikesByUser.useQuery(
  //     {
  //       candyMachineId: candyMachineId as string,
  //       walletAddress: publicKeyString || "",
  //     },
  //     {
  //       enabled: !!(publicKeyString && candyMachineId),
  //     }
  //   );

  //   const dropLikeMutation = api.candyMachine.likeUnlikeDrop.useMutation();

  return (
    <>
      <Button
        title="Like"
        variant="ghost"
        className={`${sideView ? "flex space-x-2" : "flex-col space-y-2"}`}
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onClick={handleLikeUnlike}
        // padding={padding}
      >
        <div className="block h-6 w-6">
          {/* {userLikes?.isLiked ? (
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
          )} */}
          {/* <HeartIconSolid
            className={`h-6 w-6 hover:text-primary-focus ${
              isPrimary ? "text-red-500 " : "text-base-content"
            }`}
          /> */}
          {userHasLiked ? (
            <HeartIconSolid
              className={`h-6 w-6 hover:text-primary-focus ${
                liking ? " animate-ping" : ""
              } ${isPrimary ? "text-primary " : "text-base-content"}`}
            />
          ) : (
            <HeartIconOutline
              className={`h-6 w-6 hover:text-primary-focus ${
                liking ? " animate-ping" : ""
              } ${isPrimary ? "text-primary " : "text-base-content"}`}
            />
          )}
        </div>
        {!hideNumber && (
          <Typography
            size="body-sm"
            color={isPrimary ? "primary" : "base"}
            className={`block hover:text-primary-focus`}
          >
            {songLikes?.length || 0}
            {/* {abbreviateNumber(userLikes?.candyMachine?._count?.likes || 0)} */}
          </Typography>
        )}
      </Button>
    </>
  );
}

export default GeneralLikes;
