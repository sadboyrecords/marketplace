import { useState, useEffect, useMemo } from "react";
import Typography from "@/components/typography";
import { SolIcon } from "@/components/iconComponents";
import { getSolUsdPrice } from "@/utils/rpcCalls";
import { RocketLaunchIcon } from "@heroicons/react/24/solid";
import CounterNumber from "./CountdownNumber";

function CountdownLabel({
  date,
  countDownText,
  inProgress = false,
  isStarted,
  isEnded,
  label,
  solPrice,
  redeemLimit,
  mintLimit,
  isSoldOut,
}: {
  date?: Date;
  countDownText?: string;
  inProgress?: boolean;
  isStarted?: boolean;
  isEnded?: boolean;
  label?: string;
  solPrice?: number;
  tokenPrice?: number;
  redeemLimit?: number;
  mintLimit?: number;
  isSoldOut?: boolean;
}) {
  const countDownDate = date ? new Date(date).getTime() : new Date().getTime();
  const [seconds, setSeconds] = useState<number | string | null>(null);
  const [minutes, setMinutes] = useState<number | string | null>(null);
  const [hours, setHours] = useState<number | string | null>(null);
  const [days, setDays] = useState<number | string | null>(null);
  const [solInUsd, setSolInUsd] = useState<number>();

  const handleGetPrice = async () => {
    const price = await getSolUsdPrice();
    setSolInUsd(Number(price));
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = countDownDate - now;
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      setSeconds(("0" + (seconds >= 0 ? seconds : 0)).slice(-2));
      setMinutes(("0" + (minutes >= 0 ? minutes : 0)).slice(-2));
      setHours(("0" + (hours >= 0 ? hours : 0)).slice(-2));
      setDays(("0" + (days >= 0 ? days : 0)).slice(-2));
      if (distance <= 0) {
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [date]);

  useMemo(() => {
    void handleGetPrice();
  }, []);

  return (
    // flex-col gap-6
    <div
      className={`flex flex-wrap justify-between  gap-4 rounded-lg border-[1px] px-4  py-6 ${
        inProgress ? "border-base-300" : "border-base-300"
      } ${inProgress ? "bg-base-300" : ""}`}
    >
      <div className="flex w-full flex-col justify-between gap-4">
        <div className="flex ">
          <div className="flex flex-1 ">
            <div
              className={`badge capitalize ${
                inProgress
                  ? "badge-success"
                  : " badge-ghost text-neutral-content"
              }`}
            >
              {label} - sale
            </div>
            <Typography color="neutral-content" size="body-sm">
              {isEnded && " (Ended)"}
            </Typography>
          </div>
        </div>
        {solPrice && (
          <div>
            <div className="flex items-center space-x-2 ">
              <SolIcon height={inProgress ? 20 : 15} />
              <Typography
                size={`${inProgress ? "display-sm" : "body"}`}
                className=""
              >
                {solPrice}
                {solInUsd && (
                  <span className="ml-2 text-sm text-neutral-content">
                    ({(solInUsd * solPrice).toFixed(2)} usd)
                  </span>
                )}
              </Typography>
            </div>
            {mintLimit && (
              <Typography size="body-xs" className="mt-2">
                Limited to {mintLimit}/wallet
              </Typography>
            )}
          </div>
        )}
      </div>
      <div className="w-full max-w-xs">
        <div className={`${date ? "flex w-full flex-col" : "hidden"}`}>
          <div className="flex justify-between">
            <Typography size="body" className=" mb-2">
              {countDownText}
            </Typography>
            <div className="flex flex-col justify-between space-y-2 text-right">
              {(inProgress || date) && (
                <div className="">
                  {/* <div className="badge">Limit: 2</div> */}
                  <div className="badge">
                    {redeemLimit
                      ? `Limted tokens: ${redeemLimit}`
                      : "Unlimited"}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-row justify-between text-center ">
            <CounterNumber number={days} text="Days" inProgress={inProgress} />
            <CounterNumber
              number={hours}
              text="Hours"
              inProgress={inProgress}
            />
            <CounterNumber
              number={minutes}
              text="Mins"
              inProgress={inProgress}
            />
            <CounterNumber
              number={seconds}
              text="Sec"
              inProgress={inProgress}
            />

            {/* <div className="flex flex-col">
              <span className="countdown font-mono text-5xl">{seconds}</span>
              sec
            </div> */}
          </div>
        </div>
      </div>
      {isSoldOut && (
        <div>
          <RocketLaunchIcon className="h-16 w-16 text-primary" />
          <Typography color="neutral-content" size="display-sm">
            Sold Out
          </Typography>
        </div>
      )}
    </div>
  );
}

export default CountdownLabel;
