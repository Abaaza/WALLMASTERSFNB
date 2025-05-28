import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./redux/cartReducer";
import userReducer from "./redux/userSlice"; // Import the new user slice

const store = configureStore({
  reducer: {
    cart: cartReducer,
    user: userReducer, // Add the user reducer here
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
