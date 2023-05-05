import React, { useEffect, useState } from 'react';
import ReactPlayer from 'react-player';
import { ITrack } from '@spinamp/spinamp-hooks';

type Props = {
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  step: number | string;
  className: string;
  onMouseDown: (e: React.MouseEvent<HTMLInputElement>) => void;
  onMouseUp: (e: React.MouseEvent<HTMLInputElement>) => void;
  output?: string | React.ReactNode | number;
  playerRef: React.RefObject<ReactPlayer>;
  currentToken: ITrack | null;
};

const convertToMinutes = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds - minutes * 60;
  if (isNaN(minutes) || isNaN(remainingSeconds)) return '0:00';
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${Math.floor(
    remainingSeconds
  )}`;
};

function PlayerRange({
  onChange,
  step,
  className,
  onMouseDown,
  onMouseUp,
  playerRef,
}: Props) {
  const [position, setPosition] = useState(0);
  const [maxSize, setMax] = useState(0);
  const getRangeStyle = (val: number, rangeMax: number) => ({
    backgroundSize: `${`${
      val > 0 ? (Number(val) / Number(rangeMax)) * 100 : 0
    }%`} 4px`,
    backgroundPosition: 'left center',
    backgroundRepeat: `no-repeat`,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      if (playerRef && playerRef.current) {
        setPosition(playerRef.current.getCurrentTime?.());
        setMax(playerRef.current.getDuration?.());
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [playerRef]);

  return (
    <label className={`mx-1 items-center text-xs flex gap-2 ${className}`}>
      <div className="w-2 mr-5">{convertToMinutes(position)}</div>

      <input
        className="
					range
					range-primary
					range-xs
					h-3
					w-full
					p-0
					bg-transparent
					focus:outline-none focus:ring-0 focus:shadow-none"
        // form-range
        type="range"
        min={0}
        max={maxSize}
        step={step}
        value={position || 0}
        onChange={onChange}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        style={getRangeStyle(position, maxSize)}
      />
      <div className="w-2">{convertToMinutes(maxSize)}</div>
    </label>
  );
}
export default PlayerRange;
