import Typography from "@/components/typography";
import { api } from "@/utils/api";
import TrackItem from "@/components/track/TrackItem";
import { getCreatorname } from "@/utils/helpers";
import { abbreviateNumber } from "@/utils/helpers";
import Avatar from "@/components/avatar/Avatar";

function RecentCreators() {
  const { data, isLoading } = api.artist.getTopArtists.useQuery();

  console.log({ data });

  return (
    <div className="">
      <Typography className="font-bold tracking-wider" size="display-xs">
        New Creators
      </Typography>
      <div className="mt-8 flex space-x-6 overflow-scroll">
        {/* grid grid-cols-1 gap-8 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 */}
        {isLoading && (
          <>
            {TrackItem.loader}
            {TrackItem.loader}
            {TrackItem.loader}
            {TrackItem.loader}
          </>
        )}
        {data?.map((a) => (
          <div key={a.id} className="w-48">
            <Avatar
              heightNumber={150}
              widthNumber={150}
              fill={false}
              className="w-full"
              alt={""}
              username={""}
              type="squircle"
              path={a?.pinnedProfilePicture?.path}
              pinnedStatus={a?.pinnedProfilePicture?.status}
              imageHash={a?.profilePictureHash || undefined}
            />
            {/* <div className=" relative w-48">
              <ImageDisplay
                url={
                  a.pinnedProfilePicture?.originalUrl ||
                  "/placeholder/cute-planet.jpg" ||
                  undefined
                }
                hash={a?.profilePictureHash || null} //track?.lossyArtworkIPFSHash
                width={a?.pinnedProfilePicture?.width || 100}
                height={a?.pinnedProfilePicture?.height || 100}
                // width={100}
                // height={100}
                path={a?.pinnedProfilePicture?.path}
                pinnedStatus={a?.pinnedProfilePicture?.status}
                resizeWidth={100}
                quality={50}
                alt={a?.name || "avatar"}
                // fill
                sizes="5vw"
                className={`mask mask-squircle  h-full  w-full rounded-md object-cover`}
                imgTagClassName="!w-full !h-full  rounded-md "
              />
            </div> */}
            <Typography className="mt-2 overflow-scroll font-bold">
              @
              {getCreatorname({
                name: a?.name || a?.firstName || undefined,
                walletAddress: a?.walletAddress,
              })}
            </Typography>
            <Typography size="body-xs" className="">
              {a.songs.length} Song{a.songs.length > 1 && "s"} •{" "}
              {abbreviateNumber(a.followers?.length)} Followers
            </Typography>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecentCreators;
