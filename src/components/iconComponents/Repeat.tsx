import React from "react";

function Repeat({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="24"
      viewBox="0 0 20 24"
      className={className}
      style={style}
    >
      <g
        fill="none"
        fillRule="evenodd"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        transform="translate(1 1)"
      >
        <path d="M14 0l4 4-4 4" />
        <path d="M0 10V8a4 4 0 014-4h14M4 22l-4-4 4-4" />
        <path d="M18 12v2a4 4 0 0 1-4 4H0" />
      </g>
    </svg>
  );
}

export default Repeat;
