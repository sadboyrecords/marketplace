import Typography from "@/components/typography";
import ImageDisplay from "@/components/imageDisplay/ImageDisplay";
import React from "react";
import dynamic from "next/dynamic";

// import ThreeJsBg from "@/components/backgrounds/ThreejsBg";

const ThreeJsBg = dynamic(() => import("@/components/backgrounds/ThreejsBg"), {
  ssr: false,
});

function DropHead() {
  // if (!battle) return null;
  return (
    <div>
      <ThreeJsBg />
      <div className="flex min-h-[90vh] flex-col items-center justify-center space-y-10">
        <Typography
          size="display-lg"
          className="text-center font-bold uppercase !tracking-[1rem]"
        >
          Solo Drops
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
        </div>
        <div className="flex flex-col items-center justify-center">
          <Typography
            size="body"
            className="text-center uppercase tracking-[0.2rem]"
          >
            Coming Soon!
          </Typography>
        </div>
      </div>
    </div>
  );
}

export default DropHead;
