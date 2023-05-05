import React, { createContext, useContext, useState } from "react";
// import type { ITrack } from "@spinamp/spinamp-hooks";
// import type { ITrack } from "@/utils/types";
import { type inferRouterOutputs } from "@trpc/server";
import { type AppRouter } from "@/server/api/root";

type RouterOutput = inferRouterOutputs<AppRouter>;

type SongDetailType = RouterOutput["songs"]["getSongDetails"];

type PlayerContextType = {
  isPlaying: boolean;
  setIsPlaying:
    | React.Dispatch<React.SetStateAction<boolean>>
    | (() => undefined);
  currentToken: SongDetailType | null; // ITrack | null;
  nextToken: () => void;
  prevToken: () => void;
  // setCurrentToken: React.Dispatch<React.SetStateAction<ITrack | null>>;
  setCurrentToken: React.Dispatch<React.SetStateAction<SongDetailType | null>>;
  currentPlaylist: {
    tracks: SongDetailType[]; //ITrack[];
    PlaylistName?: string;
    playlistId?: string;
  };
  setCurrentPlaylist: (playlist: {
    tracks: SongDetailType[]; //ITrack[];
    PlaylistName?: string;
    playlistId?: string;
  }) => void;
  // handlePlayPause: async (songData: any): Promise<void> => undefined;
  handlePlayPause: (songData: any) => void;
};

const PlayerContext = createContext({
  isPlaying: false,
  setIsPlaying: () => {
    return undefined;
  },
  currentToken: null,
  setCurrentToken: () => {
    return undefined;
  },
  nextToken: () => {
    return undefined;
  },
  prevToken: () => {
    return undefined;
  },
  handlePlayPause: () => {
    return undefined;
  },

  // updateCandyMachine: async (
  //   input: IMint
  // ): Promise<UpdateCandyMachineOutput | undefined> => undefined,
  currentPlaylist: {
    tracks: [],
    PlaylistName: "",
    playlistId: "",
  },
  setCurrentPlaylist: () => {
    return undefined;
  },
} as PlayerContextType);

const { Provider, Consumer } = PlayerContext;

function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentToken, setCurrentToken] = useState<any>(null);
  const [currentPlaylist, setTempCurrentPlaylist] = useState<{
    tracks: SongDetailType[]; //ITrack[];
    PlaylistName?: string;
    playlistId?: string;
  }>({ tracks: [], PlaylistName: "", playlistId: "" });

  const setCurrentPlaylist = (playlist: {
    tracks: any[];
    PlaylistName?: string;
    playlistId?: string;
  }) => {
    console.log("setting playlist", { playlist });
    // filter out any tracks that are not playable
    if (!playlist?.tracks?.length) return;

    const filteredTracks = playlist.tracks.filter(
      (track: any) =>
        !!track.id && !!(track.lossyAudioIPFSHash || track.lossyAudioURL)
    );

    // remove duplicate tracks
    const uniqueTracks = filteredTracks.filter((track: any, index: number) => {
      return filteredTracks.findIndex((t: any) => t.id === track.id) === index;
    });
    setTempCurrentPlaylist({
      tracks: uniqueTracks,
      PlaylistName: playlist.PlaylistName,
      playlistId: playlist.playlistId,
    });
    setCurrentToken(uniqueTracks?.[0] || null);
  };

  const findTokenIndex = () => {
    if (currentPlaylist.tracks.length > 0) {
      const index = currentPlaylist.tracks.findIndex(
        (track) => track?.id === currentToken?.id
      );
      return index;
      // setCurrentTokenIndex(index);
    }
    return -1;
  };

  const nextToken = async () => {
    if (currentPlaylist.tracks.length > 0) {
      const tokenIndex = findTokenIndex();
      if (tokenIndex <= currentPlaylist.tracks.length) {
        let newIndex = tokenIndex + 1;
        if (newIndex > currentPlaylist.tracks.length - 1) {
          newIndex = 0;
        }
        setCurrentToken(currentPlaylist?.tracks?.[newIndex] || null);
      } else {
        setCurrentToken(currentPlaylist?.tracks?.[0] || null);
      }
    }
  };
  const handlePlayPause = async (songData: any) => {
    if (songData && currentToken?.id !== songData.id) {
      if (isPlaying) {
        // setIsPlaying(false);
        setCurrentPlaylist({
          tracks: [...(currentPlaylist.tracks as any), songData],
          PlaylistName: currentPlaylist.PlaylistName || "",
          playlistId: currentPlaylist.playlistId || "",
        });
        setCurrentToken(songData);
      } else {
        console.log("PLAYING NEW SONG", {
          songData: songData,
          currentToken,
          currentPlaylist,
        });
        setCurrentPlaylist({
          tracks: [...(currentPlaylist.tracks as any), songData],
          PlaylistName: currentPlaylist.PlaylistName || "",
          playlistId: currentPlaylist.playlistId || "",
        });

        setCurrentToken(songData);
        setIsPlaying(true);
      }
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  type IDuration = {
    duration?: number;
    minutes?: number;
    seconds?: number;
    trackId: string;
  };
  // const [durations, setDurations] = useState<IDuration[]>([]);
  // const getDuration = async (src: string) => {
  // 	if (!src) return null
  //     const audio = new Audio();
  //     audio.src = src;
  //     audio.addEventListener("loadedmetadata", () => {
  //         const minutes = Math.floor(audio.duration / 60);
  //         const seconds = Math.floor(audio.duration % 60);
  //         // console.log({ duration: audio.duration, minutes, seconds} );
  //         // setDuration({ minutes, seconds });
  //         return { minutes, seconds };
  //     });

  // }

  // const handleDuration = async (trackId: string, src: string) => {
  // 	const timing = await getDuration(src);
  // 	console.log({ timing, src})
  // 	return timing
  // 	// const index = durations.findIndex((d) => d.trackId === trackId);

  // 	// console.log({ timing })
  // 	// if (index === -1) {
  // 	// 	setDurations([...durations, { trackId, ...getDuration(src, trackId) }]);
  // 	// } else {
  // 	// 	setDurations([
  // 	// 		...durations,
  // 	// 		{ trackId, ...getDuration(src, trackId) },
  // 	// 	]);
  // 	// }

  // }

  // useEffect(() => {
  // 	if (currentPlaylist.tracks.length > 0) {
  // 		currentPlaylist.tracks.forEach(async (track) => {
  // 			await handleDuration(track.id, track.lossyAudioURL);

  // 		});
  // 	}
  // }, [currentPlaylist]);
  // console.log({ durations });

  const prevToken = () => {
    const tokenIndex = findTokenIndex();

    if (currentPlaylist.tracks.length > 1) {
      if (tokenIndex !== 0) {
        // setCurrentTokenIndex(currentTokenIndex - 1);
        setCurrentToken(currentPlaylist?.tracks?.[tokenIndex - 1] || null);
      } else {
        // setCurrentTokenIndex(currentPlaylist.tracks.length - 1);
        setCurrentToken(
          currentPlaylist?.tracks?.[currentPlaylist.tracks.length - 1] || null
        );
      }
    }
    if (currentPlaylist.tracks.length === 1) {
      setCurrentToken(null);
      setCurrentToken(currentPlaylist?.tracks?.[0] || null);
    }
  };

  return (
    <Provider
      value={{
        isPlaying,
        setIsPlaying,
        currentToken,
        setCurrentToken,
        nextToken,
        prevToken,
        currentPlaylist,
        setCurrentPlaylist,
        handlePlayPause,
      }}
    >
      {children}
    </Provider>
  );
}

const usePlayerProvider = () => {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    console.error("usePlayerProvider must be used within a PlayerProvider");
    throw new Error("usePlayerProvider must be used within a PlayerProvider");
  }
  return context;
};

export {
  PlayerProvider,
  usePlayerProvider,
  Consumer as PlayerConsumer,
  PlayerContext,
};
