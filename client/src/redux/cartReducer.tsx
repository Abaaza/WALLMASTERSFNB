import {
  createSlice,
  PayloadAction,
  ThunkAction,
  AnyAction,
} from "@reduxjs/toolkit";
import { RootState } from "../store";

// CartItem interface
interface CartItem {
  id: string;
  name: string;
  size: string;
  quantity: number;
  price: number;
  image: string;
}

// CartState interface
interface CartState {
  cart: CartItem[];
  userId: string | null;
}

// Utility functions to handle local storage
const saveToStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving data (${key}):`, error);
  }
};

const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (error) {
    console.error(`Error loading data (${key}):`, error);
    return defaultValue;
  }
};

// Helper to get the cart key
const getCartKey = (userId: string | null) =>
  userId ? `cart_${userId}` : "guestCart";

// Initial state
const initialState: CartState = {
  cart: loadFromStorage(getCartKey(loadFromStorage("userId", null)), []), // Load guest or user cart initially
  userId: loadFromStorage("userId", null),
};

// Cart slice
const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<string | null>) => {
      state.userId = action.payload;
      saveToStorage("userId", action.payload); // Persist userId in localStorage

      // Load the appropriate cart when user ID changes
      state.cart = loadFromStorage(getCartKey(action.payload), []);
    },
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existingItem = state.cart.find(
        (item) =>
          item.id === action.payload.id && item.size === action.payload.size
      );

      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
      } else {
        state.cart.push({ ...action.payload });
      }

      saveToStorage(getCartKey(state.userId), state.cart);
    },
    removeFromCart: (
      state,
      action: PayloadAction<{ id: string; size: string }>
    ) => {
      state.cart = state.cart.filter(
        (item) =>
          item.id !== action.payload.id || item.size !== action.payload.size
      );
      saveToStorage(getCartKey(state.userId), state.cart);
    },
    incrementQuantity: (
      state,
      action: PayloadAction<{ id: string; size: string }>
    ) => {
      const item = state.cart.find(
        (item) =>
          item.id === action.payload.id && item.size === action.payload.size
      );
      if (item) item.quantity += 1;
      saveToStorage(getCartKey(state.userId), state.cart);
    },
    decrementQuantity: (
      state,
      action: PayloadAction<{ id: string; size: string }>
    ) => {
      const item = state.cart.find(
        (item) =>
          item.id === action.payload.id && item.size === action.payload.size
      );
      if (item && item.quantity > 1) {
        item.quantity -= 1;
      } else {
        state.cart = state.cart.filter(
          (cartItem) =>
            cartItem.id !== action.payload.id ||
            cartItem.size !== action.payload.size
        );
      }
      saveToStorage(getCartKey(state.userId), state.cart);
    },
    cleanCart: (state) => {
      state.cart = [];
      saveToStorage(getCartKey(state.userId), state.cart);
    },
    loadCart: (state, action: PayloadAction<CartItem[]>) => {
      state.cart = action.payload;
    },
  },
});

// Thunk action to load cart into state
export const loadCartToState =
  (userId: string | null): ThunkAction<void, RootState, unknown, AnyAction> =>
  async (dispatch) => {
    const cart = loadFromStorage(getCartKey(userId), []);
    dispatch(cartSlice.actions.loadCart(cart));
  };

// Export actions
export const {
  setUser,
  addToCart,
  removeFromCart,
  incrementQuantity,
  decrementQuantity,
  cleanCart,
  loadCart,
} = cartSlice.actions;

// Export reducer
export default cartSlice.reducer;
