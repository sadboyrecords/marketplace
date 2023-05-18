import { type PayloadAction, createSlice } from "@reduxjs/toolkit";
// import type { PayloadAction } from "@reduxjs/toolkit";

export interface RootState {
  authModal: boolean;
  publicAddress: string | undefined | null;
}

const initialState: RootState = {
  authModal: false,
  publicAddress: null,
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
    setPublicAddress: (state, action: PayloadAction<string>) => {
      state.publicAddress = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { open, close, setPublicAddress } = appSlice.actions;

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
