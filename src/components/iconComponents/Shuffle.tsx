function Shuffle({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    // <svg
    //   xmlns="http://www.w3.org/2000/svg"
    //   width="20"
    //   height="24"
    //   viewBox="0 0 20 24"
    //   className={className}
    //   style={style}
    // >
    //   <g
    //     fill="none"
    //     fillRule="evenodd"
    //     stroke="currentColor"
    //     strokeLinecap="round"
    //     strokeLinejoin="round"
    //     strokeWidth="2"
    //     transform="translate(1 1)"
    //   >
    //     <path d="M14 0l4 4-4 4" />
    //     <path d="M0 10V8a4 4 0 014-4h14M4 22l-4-4 4-4" />
    //     <path d="M18 12v2a4 4 0 0 1-4 4H0" />
    //   </g>
    // </svg>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polygon points="16 3 21 3 21 8"></polygon>
      <line x1="4" y1="20" x2="21" y2="3"></line>
      <polyline points="21 16 21 21 16 21"></polyline>
      <line x1="15" y1="15" x2="21" y2="21"></line>
      <line x1="4" y1="4" x2="9" y2="9"></line>
    </svg>
  );
}

export default Shuffle;
