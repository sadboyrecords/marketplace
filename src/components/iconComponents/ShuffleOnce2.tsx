import React from 'react';

function ShuffleOnce2({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      className={className}
      style={style}
    >
      <rect width="256" height="256" fill="none" />
      <polyline
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="24"
        points="200 88 224 64 200 40"
      />
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="24"
        d="M32,128A64,64,0,0,1,96,64H224"
      />
      <polyline
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="24"
        points="56 168 32 192 56 216"
      />
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="24"
        d="M224,128a64,64,0,0,1-64,64H32"
      />
      <polyline
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="24"
        points="116 111.993 132 104 132 152"
      />
    </svg>
  );
}

export default ShuffleOnce2;
