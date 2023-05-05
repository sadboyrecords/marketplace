import { useEffect } from 'react';

const setActionHandler = (
  action: MediaSessionAction,
  callback: (() => void) | null
) => {
  try {
    if (action && 'mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler(action, callback);
    }
  } catch (e) {
    console.error(`MediaSession Action: ${action} Not Supported`, e);
  }
};

const updatePositionState = (duration = 0, position = 0) => {
  if (!duration) return;
  if (
    'mediaSession' in navigator &&
    'setPositionState' in navigator.mediaSession
  ) {
    navigator.mediaSession.setPositionState({
      duration: duration,
      playbackRate: 1,
      position: position,
    });
  }
};

export default function MediaSession({
  image,
  title,
  artistName,
  playToken,
  pauseToken,
  seekForward,
  seekBackward,
  previousTrack,
  nextTrack,
  duration,
  currentTime,
  isPlaying,
}: {
  image: string;
  title: string;
  artistName: string;
  playToken: () => void;
  pauseToken: () => void;
  seekForward: () => void;
  seekBackward: () => void;
  previousTrack: () => void;
  nextTrack: () => void;
  duration: number;
  currentTime: number;
  isPlaying: boolean;
}) {
  useEffect(() => {
    if ('mediaSession' in navigator && window) {
      if (!image) return;
      navigator.mediaSession.metadata = new window.MediaMetadata({
        title: title,
        artist: artistName,
        album: 'NiftyTunes Marketplace',
        artwork: [{ src: image }],
      });
    }
  }, [artistName, image, title]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (isPlaying) {
        updatePositionState(duration, currentTime);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if ('mediaSession' in navigator) {
      setActionHandler('play', playToken);
    }
    return () => {
      setActionHandler('play', null);
    };
  }, [playToken]);
  useEffect(() => {
    setActionHandler('pause', pauseToken);
    return () => {
      setActionHandler('pause', null);
    };
  }, [pauseToken]);
  useEffect(() => {
    setActionHandler('seekbackward', () => {
      seekBackward();
    });
    return () => {
      setActionHandler('seekbackward', null);
    };
  }, [seekBackward]);
  useEffect(() => {
    setActionHandler('seekforward', () => {
      seekForward();
    });
    return () => {
      setActionHandler('seekforward', null);
    };
  }, [seekForward]);
  useEffect(() => {
    setActionHandler('previoustrack', () => {
      previousTrack();
    });
    return () => {
      setActionHandler('previoustrack', null);
    };
  }, [previousTrack]);
  useEffect(() => {
    setActionHandler('nexttrack', () => {
      nextTrack();
    });
    return () => {
      setActionHandler('nexttrack', null);
    };
  }, [nextTrack]);
  return null;
}
