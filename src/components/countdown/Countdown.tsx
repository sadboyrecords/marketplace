/* eslint-disable @typescript-eslint/restrict-plus-operands */
import { useState, useMemo } from "react";
import Typography from "@/components/typography";
import CounterNumber from "./CountdownNumber";

function Countdown({
  date,
  countDownText,
  inProgress = true,
  displayTimeBadge,
  fullWidth,
  fullSpread,
  centeredText,
  showBadgeBG = true,
  startDate,
  endDate,
  startDateText,
  endDateText,
  textBefore,
}: {
  date?: Date;
  startDate?: Date;
  endDate?: Date;
  countDownText?: string;
  startDateText?: string;
  endDateText?: string;
  inProgress?: boolean;
  displayTimeBadge?: boolean;
  fullWidth?: boolean;
  fullSpread?: boolean;
  centeredText?: boolean;
  showBadgeBG?: boolean;
  textBefore?: boolean;
}) {
  const [countDate, setCountDate] = useState<Date>();
  const countDownDate = countDate && new Date(countDate).getTime();
  const [seconds, setSeconds] = useState<number | string | null>(null);
  const [minutes, setMinutes] = useState<number | string | null>(null);
  const [hours, setHours] = useState<number | string | null>(null);
  const [days, setDays] = useState<number | string | null>(null);
  const [countText, setCountText] = useState<string | null>(null);

  useMemo(() => {
    if (date) {
      setCountDate(date);
      if (countDownText) {
        setCountText(countDownText);
      }
    }
    if (startDate && endDate) {
      const todaysDate = new Date().getTime();
      if (todaysDate < startDate.getTime()) {
        setCountDate(startDate);
        if (startDateText) {
          setCountText(startDateText);
        }
      }
      if (todaysDate > startDate.getTime() && todaysDate < endDate.getTime()) {
        setCountDate(endDate);
        if (endDateText) {
          setCountText(endDateText);
        }
      }
      // setCountDate(startDate);
    }
  }, [countDownText, date, endDate, endDateText, startDate, startDateText]);

  useMemo(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = (countDownDate || new Date().getTime()) - now;
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      setSeconds(("0" + seconds).slice(-2));
      setMinutes(("0" + minutes).slice(-2));
      setHours(("0" + hours).slice(-2));
      setDays(("0" + days).slice(-2));
      if (distance <= 0) {
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [countDownDate]);

  if (!countDownDate) return null;

  return (
    <div
      className={`${seconds ? "block" : "hidden"} ${
        fullWidth ? "!w-full" : ""
      }`}
    >
      {displayTimeBadge ? (
        <>
          <div
            className={`${
              showBadgeBG
                ? "badge-primary rounded-full bg-opacity-10 px-4 py-2"
                : ""
            }`}
          >
            {startDateText && textBefore && (
              <Typography size="body-sm" color="primary">
                {countText}
              </Typography>
            )}

            <Typography size="body-sm" color="primary">
              {days}D {hours}H {minutes}M {seconds}S{" "}
              {/* {!textBefore && countText} */}
            </Typography>
          </div>
        </>
      ) : (
        <>
          <Typography
            className={`text-white ${centeredText ? "text-center" : ""} mb-3`}
          >
            {countDownText}
          </Typography>
          <div
            className={`${
              fullSpread
                ? "flex justify-between"
                : "grid auto-cols-max grid-flow-col content-center gap-5 text-center"
            } `}
          >
            <CounterNumber number={days} text="Days" inProgress={inProgress} />
            <CounterNumber
              number={hours}
              text="Hours"
              inProgress={inProgress}
            />
            <CounterNumber
              number={minutes}
              text="Minutes"
              inProgress={inProgress}
            />
            <CounterNumber
              number={seconds}
              text="Seconds"
              inProgress={inProgress}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default Countdown;
