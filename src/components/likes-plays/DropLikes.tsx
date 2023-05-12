/* eslint-disable @typescript-eslint/no-misused-promises */
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { HeartIcon as HeartIconOutline } from "@heroicons/react/24/outline";
import Button from "@/components/buttons/Button";
import { toast } from "react-toastify";
import { abbreviateNumber } from "@/utils/helpers";
import { useWallet } from "@solana/wallet-adapter-react";
import { api } from "@/utils/api";
import Typography from "@/components/typography";

function DropLikes({
  hideNumber = false,
  isPrimary = true,
  sideView = false,
  padding = "sm",
  candyMachineId,
}: {
  candyMachineId?: string;
  hideNumber?: boolean;
  sideView?: boolean;
  isPrimary?: boolean;
  padding?: "none" | "xs" | "sm";
}) {
  const { publicKey } = useWallet();
  const utils = api.useContext();
  const publicKeyString = publicKey?.toBase58() || null;

  const { data: userLikes } = api.candyMachine.getLikesByUser.useQuery(
    {
      candyMachineId: candyMachineId as string,
      walletAddress: publicKeyString || "",
    },
    {
      enabled: !!(publicKeyString && candyMachineId),
    }
  );

  const dropLikeMutation = api.candyMachine.likeUnlikeDrop.useMutation();

  const handleLikeUnlike = async () => {
    if (!publicKey) {
      toast.error("Connect your wallet first");
      return;
    }
    if (!candyMachineId) return;
    try {
      const newLike = !userLikes?.isLiked;
      console.log({ newLike });
      await dropLikeMutation.mutateAsync({
        isLiked: newLike,
        userWallet: publicKey?.toBase58(),
        candyMachineId: candyMachineId,
      });
      await utils.candyMachine.getLikesByUser.invalidate({
        candyMachineId: candyMachineId,
        walletAddress: publicKey?.toBase58(),
      });
    } catch (error) {
      console.log({ error });
      toast.error("Sorry something went wrong");
    }
  };

  return (
    <>
      <Button
        className={`${sideView ? "flex space-x-2" : "flex-col space-y-2"}`}
        onClick={handleLikeUnlike}
        variant="ghost"
        // padding={padding}
      >
        <div className="block h-6 w-6">
          {userLikes?.isLiked ? (
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
            size="body-sm"
            color={isPrimary ? "primary" : "base"}
            className={`block hover:text-primary-focus`}
          >
            {abbreviateNumber(userLikes?.candyMachine?._count?.likes || 0)}
          </Typography>
        )}
      </Button>
    </>
  );
}

export default DropLikes;
