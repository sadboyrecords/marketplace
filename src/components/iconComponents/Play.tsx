import React from "react";

function Play({
  className,
  style,
  onClick,
}: {
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}) {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      onClick={onClick}
    >
      <circle cx="24" cy="24" r="24" fill="#5D5FEF" />
      <path
        transform="translate(12, 12)"
        d="M6.62788 0.160197C7.67193 -0.166528 8.82415 0.0157091 9.62092 0.622949L21.9262 10.016C23.3661 11.1133 23.354 12.8862 21.9133 13.9848L9.57799 23.3772C8.77951 23.9838 7.6745 24.1667 6.62874 23.8399C5.58556 23.5126 5 22.7413 5 21.8848V2.11534C5.00086 1.25818 5.58298 0.486922 6.62788 0.160197Z"
        fill="white"
      />
    </svg>
  );
}

/**
 * 
 * <path
				d="M6.62788 0.160197C7.67193 -0.166528 8.82415 0.0157091 9.62092 0.622949L21.9262 10.016C23.3661 11.1133 23.354 12.8862 21.9133 13.9848L9.57799 23.3772C8.77951 23.9838 7.6745 24.1667 6.62874 23.8399C5.58556 23.5126 5 22.7413 5 21.8848V2.11534C5.00086 1.25818 5.58298 0.486922 6.62788 0.160197Z"
				fill="white"
			/>
 */

export default Play;
