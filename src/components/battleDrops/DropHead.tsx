import Typography from "@/components/typography";
import Countdown from "@/components/countdown/Countdown";
import ImageDisplay from "@/components/imageDisplay/ImageDisplay";
import { api } from "@/utils/api";
import LineUp from "@/components/battleDrops/LineUp";
import React from "react";

function DropHead() {
  const { data: battle, isLoading } = api.battle.getHomePageBattle.useQuery();

  const today = new Date();
  const twoWeeksLater = new Date();
  twoWeeksLater.setDate(today.getDate() + 14);
  const [text, setText] = React.useState<string>("");

  React.useMemo(() => {
    if (battle?.battleStartDate && battle?.battleStartDate > new Date()) {
      setText("Support your favourite Artist In...");
    }

    if (battle?.battleEndDate && battle?.battleEndDate > new Date()) {
      setText("Support your favourite Artist For Another...");
    }

    if (
      battle?.battleStartDate &&
      battle?.battleStartDate < new Date() &&
      battle?.battleEndDate &&
      battle?.battleEndDate < new Date()
    ) {
      setText("Too late, the battle has ended");
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
  );
}

export default DropHead;
