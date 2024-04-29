import React from "react";
import { useRouter } from "next/router";
import { api } from "@/utils/api";
import ImageDisplay from "../imageDisplay/ImageDisplay";
import Typography from "../typography";
import Link from "next/link";
import { routes } from "@/utils/constants";
import AvatarImage from "../avatar/Avatar";
import { getCreatorname } from "@/utils/helpers";
import PlayButton from "../likes-plays/PlayButton";
import GeneralLikes from "../likes-plays/GeneralLikes";

type Props = {
  passedSlug?: string;
};

function LeakDetails({ passedSlug }: Props) {
  const router = useRouter();
  const { slug } = router.query;
  const { data, isLoading } = api.leaks.getLeak.useQuery(
    { slug: passedSlug || (slug as string) },
    {
      enabled: !!(passedSlug || slug),
    }
  );
  if (isLoading)
    return (
      <div className="flex  flex-col items-center space-y-6 text-center">
        <div className="h-64 w-full max-w-xl animate-pulse rounded-md bg-border-gray" />
      </div>
    );
  return (
    <div className=" flex  flex-col items-center space-y-6 text-center sm:min-w-[400px]">
      {!passedSlug && (
        <Typography size="display-2xl">{data?.leakName}</Typography>
      )}

      <div className=" w-full  max-w-xl ">
        <ImageDisplay
          className="aspect-1 h-full w-full rounded-xl object-cover"
          // object-cover
          alt="Leak Image"
          path={data?.pinnedImage?.path || undefined}
          hash={data?.imageIpfsHash || null}
          quality={100}
          pinnedStatus={data?.pinnedImage?.status}
          //   fill
          sizes="(max-width: 640px) 90vw, (max-width: 800px) 60vw, (max-width: 800px) 50vw, (max-width: 1200px) 40vw, 30vw"
          width={data?.pinnedImage?.width || 500}
          height={data?.pinnedImage?.height || 500}
        />
      </div>
      {data?.songs.map((s) => (
        <div
          key={s.id}
          className="flex w-full max-w-xl flex-shrink items-center justify-between"
        >
          <div>
            {s?.creators.map((c) => (
              <Link
                key={c.walletAddress}
                href={routes.userProfile(c.walletAddress || "")}
                className="flex items-center space-x-2"
              >
                <AvatarImage
                  alt="artist profile picture"
                  username={c.name || c.walletAddress || ""}
                  type="squircle"
                  quality={50}
                  path={c.pinnedProfilePicture?.path}
                  pinnedStatus={c?.pinnedProfilePicture?.status}
                  imageHash={c?.pinnedProfilePicture?.ipfsHash}
                />
                <Typography>
                  {c.name ||
                    getCreatorname({
                      name: c.name || "",
                      walletAddress: c.walletAddress,
                    })}{" "}
                </Typography>
              </Link>
            ))}
          </div>
          <div className="">
            <PlayButton
              song={data?.songs[0] || null}
              playlistName={data?.leakName}
              // tracks={
              //   tracks && tracks?.length > 0 ? (tracks as SongType[]) : undefined
              // }
              // disabled={
              //   battle?.battleStartDate && battle?.battleStartDate > new Date()
              // }
            />
            <GeneralLikes
              //   candyMachineId={drop?.candyMachineId}
              songId={s?.id}
              isPrimary={true}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default LeakDetails;
