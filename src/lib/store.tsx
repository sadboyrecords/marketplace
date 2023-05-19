import { configureStore } from "@reduxjs/toolkit";
import candyMachineReducer from "@/lib/slices/candyMachine";
import audioReducer from "@/lib/slices/audioSlice";
import appReducer from "@/lib/slices/appSlice";

export const store = configureStore({
  reducer: {
    candyMachine: candyMachineReducer,
    audio: audioReducer,
    app: appReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
