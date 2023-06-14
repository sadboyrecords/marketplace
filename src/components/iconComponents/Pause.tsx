import React from 'react';

function Pause({
  className,
  style,
  width = 24,
  height = 24,
}: {
  className?: string;
  style?: React.CSSProperties;
  width?: number;
  height?: number;
}) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      <circle cx="24" cy="24" r="24" fill="#5D5FEF" />
      <path d="M18 15V33H22V15H18ZM26 15V33H30V15H26Z" fill="white" />
    </svg>
  );
}

export default Pause;
