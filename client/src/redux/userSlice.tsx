// src/redux/userSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  saveUserData,
  clearUserData,
  getUserId,
} from "../ProfileScreens/authUtils";

interface UserState {
  userId: string | null;
  name: string | null;
  email: string | null;
}

const initialState: UserState = {
  userId: getUserId(), // Initialize from localStorage if available
  name: null,
  email: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (
      state,
      action: PayloadAction<{
        userId: string | null;
        name: string | null;
        email: string | null;
      }>
    ) => {
      const { userId, name, email } = action.payload;

      if (state.userId !== userId) {
        state.userId = userId;
        state.name = name;
        state.email = email;
        // Save to localStorage using error-safe utility
        if (userId) saveUserData(userId, name || "", email || "");
      }
    },
    clearUser: (state) => {
      state.userId = null;
      state.name = null;
      state.email = null;
      clearUserData(); // Clear user data from localStorage
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
