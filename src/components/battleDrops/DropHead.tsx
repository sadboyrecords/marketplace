import Typography from "@/components/typography";
import Countdown from "@/components/countdown/Countdown";
import ImageDisplay from "@/components/imageDisplay/ImageDisplay";
import { api } from "@/utils/api";
import LineUp from "@/components/battleDrops/LineUp";
import React from "react";
import dynamic from "next/dynamic";
import { TrophyIcon } from "@heroicons/react/24/solid";
import AvatarImage from "../avatar/Avatar";
import { useSelector } from "react-redux";
import { selectBattleWinner } from "@/lib/slices/appSlice";
import Link from "next/link";
import { routes } from "@/utils/constants";

// import ThreeJsBg from "@/components/backgrounds/ThreejsBg";

const ThreeJsBg = dynamic(() => import("@/components/backgrounds/ThreejsBg"), {
  ssr: false,
});

function DropHead() {
  const { data: battle, isLoading } = api.battle.getHomePageBattle.useQuery();

  const battleWinner = useSelector(selectBattleWinner);
  const today = new Date();
  const twoWeeksLater = new Date();
  twoWeeksLater.setDate(today.getDate() + 14);
  const [text, setText] = React.useState<string>("");

  React.useMemo(() => {
    console.log({ start: battle?.battleStartDate });
    const todaysDate = new Date().getTime();
    // if (
    //   battle?.battleStartDate &&
    //   todaysDate < battle?.battleStartDate?.getTime()
    // ) {
    //   setText("Support your favourite Artist In...");
    // }
    if (battle?.battleStartDate && battle?.battleStartDate > new Date()) {
      setText("Support your favourite Artist In...");
    } else {
      if (battle?.battleEndDate && battle?.battleEndDate > new Date()) {
        setText("Support your favourite Artist For Another...");
      }
    }

    if (
      battle?.battleStartDate &&
      battle?.battleStartDate < new Date() &&
      battle?.battleEndDate &&
      battle?.battleEndDate < new Date()
    ) {
      setText("The battle has ended but we have a winner");
    }
  }, [battle]);

  // if (isLoading) {
  //   return (
  //     <div className="flex min-h-[20rem] flex-col items-center justify-center space-y-10">
  //       <div className="h-10 w-36 animate-pulse bg-border-gray" />
  //       <div className="h-32 w-32 animate-pulse bg-border-gray"></div>

  //     </div>
  //   );
  // }

  // if (!battle) return null;
  return (
    <div>
      <ThreeJsBg />
      <div className="flex min-h-[20rem] flex-col items-center justify-center space-y-10">
        <Typography
          size="display-lg"
          className="text-center font-bold uppercase !tracking-[1rem]"
        >
          Battle Drops
        </Typography>
        <div className="h-32 w-32">
          <ImageDisplay
            alt="Thunder image"
            url="images/lightning.png"
            quality={80}
            fill
            width={300}
            height={300}
            sizes="10vw"
            hash={null}
          />
          {/* <Image
            src="/images/li.png"
        
        /> */}
        </div>
        <div className="flex flex-col items-center justify-center">
          <Typography
            size="body"
            className="text-center uppercase tracking-[0.2rem]"
          >
            {!isLoading && <>{battle ? text : "Coming Soon"}</>}
          </Typography>
          {battleWinner && (
            <div className="mt-8 flex items-center gap-3">
              <div className=" rounded-full  p-3  sm:p-5">
                {/* bg-green-600 */}
                <div className="relative">
                  {/* <div className="absolute left-1/2 top-0  -translate-x-1/2 animate-ping rounded-full border border-green-100 p-4" />
                   <div className="absolute left-1/2 top-0  -translate-x-1/2 animate-ping rounded-full border border-green-300 p-5" /> */}

                  <TrophyIcon className="h-16 w-16 text-yellow-500 sm:h-32 sm:w-32" />
                </div>
              </div>

              <Link
                href={routes.artistProfile(battleWinner.walletAddress || "")}
                className="flex items-center gap-2"
              >
                <AvatarImage
                  alt="artist profile picture"
                  username={battleWinner.artistName || ""}
                  type="squircle"
                  quality={50}
                  path={battleWinner.imagePath}
                  pinnedStatus={battleWinner.pinnedStatus}
                  imageHash={battleWinner.imageHash}
                  heightNumber={70}
                  widthNumber={70}
                />
                <Typography className="font-bold">
                  {battleWinner.artistName?.toUpperCase()}{" "}
                </Typography>
              </Link>
            </div>
          )}

          {battle && (
            <Countdown
              fullWidth
              fullSpread
              startDate={battle.battleStartDate}
              endDate={battle?.battleEndDate}
            />
          )}
        </div>
        {isLoading && (
          <div className="min-h-20 flex w-full items-center justify-center gap-6">
            <div className="h-56  w-5/12 max-w-md animate-pulse  bg-border-gray" />
            <div className="h-56 w-1/12  animate-pulse bg-border-gray" />
            <div className="h-56  w-5/12 max-w-md animate-pulse  bg-border-gray" />
          </div>
        )}
        {battle && <LineUp data={battle} />}
      </div>
    </div>
  );
}

export default DropHead;
