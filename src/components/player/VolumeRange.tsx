import React from "react";

type Props = {
  label: string | React.ReactNode;
  name: string;
  max: number;
  min: number | string;
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  step: number | string;
  className: string;
  output?: string | React.ReactNode | number;
};

function VolumeRange({
  label,
  name,
  max,
  min,
  value,
  onChange,
  step,
  className,
}: Props) {
  const getRangeStyle = (val: number, rangeMax: number) => ({
    backgroundSize: `${`${
      val > 0 ? (Number(val) / Number(rangeMax)) * 100 : 0
    }%`} 4px`,
    backgroundPosition: "left center",
    backgroundRepeat: `no-repeat`,
  });
  return (
    <label className={`mx-1 items-center text-xs ${className}`}>
      {label}
      <input
        className="
					range
					range-primary
					range-xs
					ml-2
					h-3
					w-full
					p-0
					focus:shadow-none focus:outline-none focus:ring-0"
        //  form-range bg-transparent h-6
        type="range"
        min={min}
        name={name}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
        style={getRangeStyle(value, max)}
      />
    </label>
  );
}
export default VolumeRange;
