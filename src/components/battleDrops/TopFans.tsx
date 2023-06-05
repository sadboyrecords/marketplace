import Typography from "@/components/typography";
import ImageDisplay from "@/components/imageDisplay/ImageDisplay";
import Link from "next/link";
import { routes } from "@/utils/constants";
import { getCreatorname } from "@/utils/helpers";
import { useSelector, useDispatch } from "react-redux";
import {
  selectBattleDetailsAndSupporters,
  closeJoinBattleFansModal,
} from "@/lib/slices/appSlice";

type TopFans = {
  supporters?: ISupporters;
  isModal?: boolean;
};
function TopFans({ supporters, isModal }: TopFans) {
  // console.log({ supporters });
  const dispatch = useDispatch();
  const battleInfo = useSelector(selectBattleDetailsAndSupporters);
  if (!supporters || (supporters && Object.keys(supporters).length === 0))
    return null;
  return (
    <div className="flex flex-col items-start space-y-3">
      <div className="flex flex-col items-start">
        <Typography size="display-xs" className="font-bold ">
          Top Fans of {battleInfo?.artistName}
        </Typography>
        <Typography size="body-sm" color="neutral-content">
          Purchase this digital collectible and join other fans
        </Typography>
      </div>
      <div
        className={`grid  w-full  ${
          isModal
            ? "max-h-96 grid-cols-2 gap-3 overflow-scroll sm:grid-cols-3"
            : "grid-cols-2 gap-x-3"
        }`}
      >
        {Object?.keys(supporters || {}).map((key) => (
          <Link
            key={key}
            href={routes.userProfile(key)}
            onClick={() => {
              dispatch(closeJoinBattleFansModal());
            }}
            // target="_blank"
          >
            <div className=" relative w-full rounded-2xl">
              <ImageDisplay
                quality={70}
                sizes="20vw"
                // fill
                url="/placeholder/cute-planet.jpg"
                className="aspect-1 rounded-lg object-cover"
                imgTagClassName="rounded-lg"
                height={
                  supporters?.[key]?.[0]?.user?.pinnedProfilePicture?.height
                }
                width={
                  supporters?.[key]?.[0]?.user?.pinnedProfilePicture?.width ||
                  200
                }
                path={supporters?.[key]?.[0]?.user?.pinnedProfilePicture?.path}
                pinnedStatus={
                  supporters?.[key]?.[0]?.user?.pinnedProfilePicture?.status
                }
                hash={
                  supporters?.[key]?.[0]?.user?.pinnedProfilePicture
                    ?.ipfsHash as string
                }
              />
              <div className="absolute bottom-0 w-full ">
                <div className="m-2 rounded-md bg-black/40 p-1 backdrop-blur">
                  <Typography size="body-sm" className="font-bold text-white">
                    {getCreatorname({
                      walletAddress:
                        supporters?.[key]?.[0]?.user?.magicSolanaAddress || key,
                      name: supporters?.[key]?.[0]?.user?.name || "",
                    })}
                  </Typography>
                  <Typography size="body-xs" className="text-white">
                    {supporters?.[key]?.length} Collected
                  </Typography>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default TopFans;
