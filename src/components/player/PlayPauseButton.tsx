import React from 'react';

function PlayPauseButton({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button className={className} onClick={onClick}>
      {children || 'Play/Pause'}
    </button>
  );
}

export default PlayPauseButton;
