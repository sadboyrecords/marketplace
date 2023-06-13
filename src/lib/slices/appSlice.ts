import { type PayloadAction, createSlice } from "@reduxjs/toolkit";
import type { BattleType, BattleTypeSummary } from "@/utils/types";

export interface RootState {
  authModal: boolean;
  publicAddress: string | undefined | null;
  joinBattleFansModal: boolean;
  battleDetailsAndSupporters: {
    battleName?: string;
    artistName?: string;
    collectionName?: string;
    candymachineId?: string;
    competitorCandyId?: string;
    supporters: ISupporters | undefined | null;
  } | null;
  onRamperModal: boolean;
}

const initialState: RootState = {
  authModal: false,
  publicAddress: null,
  joinBattleFansModal: false,
  battleDetailsAndSupporters: null,
  onRamperModal: false,
};

export const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    open: (state) => {
      state.authModal = true;
    },
    close: (state) => {
      state.authModal = false;
    },
    setPublicAddress: (state, action: PayloadAction<string | null>) => {
      state.publicAddress = action.payload;
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
    closeJoinBattleFansModal: (state) => {
      state.joinBattleFansModal = false;
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
} = appSlice.actions;

export const selectOnrampModal = (state: { app: RootState }) =>
  state.app.onRamperModal;

export const selectJoinBattleFansModal = (state: { app: RootState }) =>
  state.app.joinBattleFansModal;

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
