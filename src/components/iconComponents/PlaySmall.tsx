import React from "react";

function PlaySmall({
  className,
  width,
  height,
}: {
  className?: string;
  width?: number;
  height?: number;
}) {
  return (
    <svg
      width={width || 48}
      height={height || 48}
      viewBox="0 0 19 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      className={`text-primary-300 ${className}`}
    >
      <g opacity="1">
        <path
          d="M17.9386 8.55179L3.30946 0.196935C2.87698 -0.0364552 2.33995 0.00242892 1.93437 0.00242892C0.312018 0.00242892 0.319214 1.13779 0.319214 1.42543V18.5018C0.319214 18.745 0.312112 19.9249 1.93437 19.9249C2.33995 19.9249 2.87707 19.9636 3.30946 19.7303L17.9385 11.3756C19.1393 10.7279 18.9318 9.96363 18.9318 9.96363C18.9318 9.96363 19.1394 9.19934 17.9386 8.55179Z"
          fill={"currentColor"}
        />
      </g>
    </svg>
  );
}

export default PlaySmall;
