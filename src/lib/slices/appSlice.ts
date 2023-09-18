import { type PayloadAction, createSlice } from "@reduxjs/toolkit";

interface BattleWinner {
  collectionName?: string;
  artistName?: string;
  walletAddress?: string;
  imagePath?: string;
  pinnedStatus?: string;
  imageHash?: string;
}
export interface RootState {
  authModal: boolean;
  publicAddress: string | undefined | null;
  joinBattleFansModal: boolean;
  topFansModal: boolean;
  battleWinner: BattleWinner | null;
  battleDetailsAndSupporters: {
    battleName?: string;
    artistName?: string;
    collectionName?: string;
    candymachineId?: string;
    competitorCandyId?: string;
    supporters: ISupporters | undefined | null;
    isEnded?: boolean;
    startDate?: Date;
    endDate?: Date;
  } | null;
  onRamperModal: boolean;
  lookupAddress: string | null;
}

const initialState: RootState = {
  authModal: false,
  publicAddress: null,
  joinBattleFansModal: false,
  battleDetailsAndSupporters: null,
  onRamperModal: false,
  topFansModal: false,
  battleWinner: null,
  lookupAddress: null,
};

export const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setLookupAddress: (state, action: PayloadAction<string | null>) => {
      state.lookupAddress = action.payload;
    },
    open: (state) => {
      state.authModal = true;
    },
    close: (state) => {
      state.authModal = false;
    },
    setPublicAddress: (state, action: PayloadAction<string | null>) => {
      state.publicAddress = action.payload;
    },
    setBattleWinner: (state, action: PayloadAction<BattleWinner | null>) => {
      state.battleWinner = action.payload;
    },
    openJoinBattleFansModal: (
      state,
      action: PayloadAction<{
        battleName?: string;
        artistName?: string;
        collectionName?: string;
        supporters: ISupporters | undefined | null;
        candymachineId?: string;
        competitorCandyId?: string;
      }>
    ) => {
      state.joinBattleFansModal = true;
      state.battleDetailsAndSupporters = action.payload;
    },
    openTopFansModal: (
      state,
      action: PayloadAction<{
        battleName?: string;
        artistName?: string;
        collectionName?: string;
        supporters: ISupporters | undefined | null;
        candymachineId?: string;
        competitorCandyId?: string;
        isEnded?: boolean;
      }>
    ) => {
      state.topFansModal = true;
      state.battleDetailsAndSupporters = action.payload;
    },
    closeJoinBattleFansModal: (state) => {
      state.joinBattleFansModal = false;
      state.battleDetailsAndSupporters = null;
    },
    closeTopFansModal: (state) => {
      state.topFansModal = false;
      state.battleDetailsAndSupporters = null;
    },
    openOnramp: (state) => {
      state.onRamperModal = true;
    },
    closeOnramp: (state) => {
      state.onRamperModal = false;
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  open,
  close,
  setPublicAddress,
  openJoinBattleFansModal,
  closeJoinBattleFansModal,
  openOnramp,
  closeOnramp,
  closeTopFansModal,
  openTopFansModal,
  setBattleWinner,
  setLookupAddress,
} = appSlice.actions;

export const selectLookupAddress = (state: { app: RootState }) => {
  return state.app.lookupAddress;
};

export const selectOnrampModal = (state: { app: RootState }) =>
  state.app.onRamperModal;

export const selectBattleWinner = (state: { app: RootState }) =>
  state.app.battleWinner;

export const selectJoinBattleFansModal = (state: { app: RootState }) =>
  state.app.joinBattleFansModal;

export const selectTopFansModal = (state: { app: RootState }) =>
  state.app.topFansModal;

export const selectBattleDetailsAndSupporters = (state: { app: RootState }) =>
  state.app.battleDetailsAndSupporters;

export const selectAuthModal = (state: { app: RootState }) =>
  state.app.authModal;

export const selectPublicAddress = (state: { app: RootState }) =>
  state.app.publicAddress;
// export const selectCandyMachine = (state: RootState) => state.cm;
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

export default appSlice.reducer;
