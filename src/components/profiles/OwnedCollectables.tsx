import MarginLayout from "@/components/layouts/MarginLayout";
import Typography from "@/components/typography";
import { api } from "@/utils/api";
import TrackItem from "@/components/track/TrackItem";
import { useRouter } from "next/router";
import OwnedNftsData from "./OwnedNftsData";

function OwnedCollectables() {
  const router = useRouter();
  const { slug } = router.query;

  const { data: userData } = api.user.getUser.useQuery(
    {
      publicKey: (slug as string | undefined) || "",
    },
    {
      enabled: !!slug,
    }
  );

  // if (isLoading)
  //   return (
  //     <MarginLayout>
  //       <div className=" h-4 w-32 animate-pulse bg-slate-500/30" />
  //       <div className="mt-6 grid grid-cols-1 sm:grid-cols-2">
  //         {TrackItem.loader}
  //         {TrackItem.loader}
  //         {TrackItem.loader}
  //         {TrackItem.loader}
  //       </div>
  //     </MarginLayout>
  //   );

  return (
    <MarginLayout>
      <Typography className="font-bold tracking-wider" size="display-xs">
        Owned Collectables
      </Typography>
      {/* <Typography className="" size="body-sm" color="neutral-gray">
        {playlists?.length} Collectables
      </Typography> */}
      <div className="mt-8 flex space-x-10 overflow-scroll ">
        <OwnedNftsData
          walletAddress={
            userData?.magicSolanaAddress || userData?.walletAddress
          }
        />
      </div>
    </MarginLayout>
  );
}

export default OwnedCollectables;
