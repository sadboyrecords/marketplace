import React from "react";
import Typography from "../typography";
import dynamic from "next/dynamic";
import { api } from "@/utils/api";
import LeakDetails from "./LeakDetails";

const ThreeJsBg = dynamic(() => import("@/components/backgrounds/ThreejsBg"), {
  ssr: false,
});

function LeakHead() {
  const { data, isLoading } = api.leaks.getFeaturedLeaks.useQuery();
  const featuredLeak = data?.[0];
  return (
    <div className="">
      <ThreeJsBg />
      <div className="flex min-h-[90vh]  flex-col items-center justify-center space-y-10 ">
        <Typography
          size="display-lg"
          className="text-center font-bold uppercase !tracking-[1rem]"
        >
          Nifty Leaks
        </Typography>
        <Typography
          size="body"
          className="text-center uppercase tracking-[0.2rem]"
        >
          {!isLoading && (
            <>{featuredLeak ? featuredLeak.leakName : "Coming Soon"}</>
          )}
        </Typography>
        <div>
          <LeakDetails passedSlug={featuredLeak?.slug} />
        </div>

        {/* <div className="h-32 w-32">
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
        </div> */}
      </div>
    </div>
  );
}

export default LeakHead;
