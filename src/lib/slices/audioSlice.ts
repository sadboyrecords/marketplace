import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { SongType, PartialSongType } from "@/utils/types";

export interface RootState {
  value: number;
  currentSong?: SongType | PartialSongType;
  isPlaying?: boolean;
  volume?: number;
  muted?: boolean;
  duration: number;
  loop?: boolean;
  seeking?: boolean;
  progress?: number;
  played: number;
  playedSeconds: number;
  loaded: number;
  loadedSeconds: number;
  shuffle?: boolean;
  playlist?: {
    tracks: SongType[];
    playlistName?: string;
  };
}

const initialState: RootState = {
  value: 0,
  currentSong: undefined,
  playlist: undefined,
  isPlaying: false,
  volume: 0.6,
  duration: 0,
  seeking: false,
  progress: 0,
  played: 0,
  loaded: 0,
  loadedSeconds: 0,
  playedSeconds: 0,
  shuffle: false,
  loop: false,
};

export const audioSlice = createSlice({
  name: "audio",
  initialState,
  reducers: {
    increment: (state) => {
      // Redux Toolkit allows us to write "mutating" logic in reducers. It
      // doesn't actually mutate the state because it uses the Immer library,
      // which detects changes to a "draft state" and produces a brand new
      // immutable state based off those changes
      state.value += 1;
      //   state.cm["1"]?.candies = 2;
    },
    decrement: (state) => {
      state.value -= 1;
    },
    incrementByAmount: (state, action: PayloadAction<number>) => {
      state.value += action.payload;
    },
    setCurrentSong: (state, action: PayloadAction<SongType>) => {
      const found = state.playlist?.tracks.find(
        (t) => t?.id === action.payload?.id
      );

      if (!found && state.playlist) {
        state.playlist.tracks = [...state.playlist?.tracks, action.payload];
      }
      if (!found && !state.playlist?.tracks) {
        state.playlist = {
          tracks: [action.payload],
          playlistName: "",
        };
      }
      if (state.currentSong?.id === action.payload?.id) {
        state.isPlaying = !state.isPlaying;
      } else {
        state.currentSong = action.payload;
        state.isPlaying = true;
      }
    },
    setPlaylist: (
      state,
      action: PayloadAction<{
        playlistName: string;
        tracks: SongType[];
        currentTrack: SongType;
      }>
    ) => {
      if (!action.payload.tracks) return;
      if (!action.payload.currentTrack) return;
      if (!action.payload.playlistName) return;

      state.playlist = {
        tracks: action.payload.tracks,
        playlistName: action.payload.playlistName,
      };

      return state;
    },
    pause: (state) => {
      state.isPlaying = false;
    },
    play: (state) => {
      state.isPlaying = true;
    },
    setDuration: (state, action: PayloadAction<number>) => {
      state.duration = action.payload;
    },
    setProgress: (
      state,
      action: PayloadAction<{
        played: number;
        loaded: number;
        playedSeconds: number;
        loadedSeconds: number;
      }>
    ) => {
      if (state.seeking) return;
      state.played = action.payload.played;
      state.loaded = action.payload.loaded;
      state.playedSeconds = action.payload.playedSeconds;
      state.loadedSeconds = action.payload.loadedSeconds;
    },
    setSeeking: (state, action: PayloadAction<boolean>) => {
      state.seeking = action.payload;
    },
    setPlayed: (state, action: PayloadAction<number>) => {
      state.played = action.payload;
    },
    setNext: (state) => {
      if (!state.playlist?.tracks) return;
      const currentIndex = state.playlist?.tracks.findIndex(
        (t) => t?.id === state.currentSong?.id
      );
      if (currentIndex === undefined) return;
      const nextIndex = currentIndex + 1;
      if (nextIndex >= state.playlist?.tracks?.length) {
        state.currentSong = state.playlist?.tracks[0];
        state.isPlaying = true;
        return;
      }
      state.currentSong = state.playlist?.tracks[nextIndex];
      state.isPlaying = true;
    },
    setPrev: (state) => {
      if (!state.playlist?.tracks) return;
      const currentIndex = state.playlist?.tracks.findIndex(
        (t) => t?.id === state.currentSong?.id
      );
      if (currentIndex === undefined) return;
      const prevIndex = currentIndex - 1;
      if (prevIndex < 0) {
        state.currentSong =
          state.playlist?.tracks[state.playlist?.tracks?.length - 1];
        state.isPlaying = true;
        state.played = 0;
        state.playedSeconds = 0;
        return;
      }
      state.currentSong = state.playlist?.tracks[prevIndex];
      state.isPlaying = true;
      state.played = 0;
      state.playedSeconds = 0;
    },
    setShuffle: (state) => {
      state.shuffle = !state.shuffle;
    },
    setLoop: (state) => {
      state.loop = !state.loop;
    },
    onEnd: (state) => {
      if (!state.playlist?.tracks) return;
      if (state.shuffle) {
        const randomIndex = Math.floor(
          Math.random() * state.playlist?.tracks?.length
        );
        state.currentSong = state.playlist?.tracks[randomIndex];
        state.isPlaying = true;
        state.played = 0;
        state.playedSeconds = 0;
        return;
      }

      const currentIndex = state.playlist?.tracks.findIndex(
        (t) => t?.id === state.currentSong?.id
      );
      if (currentIndex === undefined) return;
      const nextIndex = currentIndex + 1;
      if (nextIndex >= state.playlist?.tracks?.length) {
        if (state.loop) {
          state.currentSong = state.playlist?.tracks[0];
          state.isPlaying = true;
          state.played = 0;
          state.playedSeconds = 0;
          return;
        }
        state.isPlaying = false;
        state.played = 0;
        state.playedSeconds = 0;
        return;
      }
      state.currentSong = state.playlist?.tracks[nextIndex];
      state.isPlaying = true;
      state.played = 0;
      state.playedSeconds = 0;
    },
    setVolume: (state, action: PayloadAction<number>) => {
      state.volume = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  setCurrentSong,
  pause,
  play,
  setPlaylist,
  setDuration,
  setProgress,
  setSeeking,
  setPlayed,
  setNext,
  setPrev,
  onEnd,
  setShuffle,
  setLoop,
  setVolume,
} = audioSlice.actions;

export const selectCount = (state: { audio: RootState }) => state.audio.value;

export const selectCurrentSong = (state: { audio: RootState }) =>
  state.audio.currentSong;
export const selectPlalist = (state: { audio: RootState }) =>
  state.audio.playlist;

export const selectIsPlaying = (state: { audio: RootState }) =>
  state.audio.isPlaying;

export const selectAudio = (state: { audio: RootState }) => state.audio;

export default audioSlice.reducer;
// export const selectCandyMachine = (id: string) => (state: RootState) => {
//     return state.cm[id];
// }
// export const selectCandyMachine = (id: string) =>
//   createSelector(
//     (state: RootState) => state.candyMachines[id],
//     (candyMachine) => candyMachine
//   );
// export const selectCandyMachine = createSelector(
//   [(state: RootState) => state.cm, (state: RootState, id: string) => id],
//   (cm, id) => cm?.[id]
// );

// const items = selectItemsByCategory(state, 'javascript');
// // Another way if you're using redux hook:
// const items = useSelector(state => selectItemsByCategory(state, 'javascript'));
