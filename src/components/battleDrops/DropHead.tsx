import Typography from "@/components/typography";
import Countdown from "@/components/countdown/Countdown";
import Image from "next/image";
import ImageDisplay from "@/components/imageDisplay/ImageDisplay";

function DropHead() {
  const today = new Date();
  const twoWeeksLater = new Date();
  twoWeeksLater.setDate(today.getDate() + 14);
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
          Support your favourite Artist
        </Typography>
        <Countdown fullWidth fullSpread date={twoWeeksLater} />
      </div>
    </div>
  );
}

export default DropHead;
