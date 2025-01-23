import { clearAuthData } from "@/app/services/authService";
import { createSlice } from "@reduxjs/toolkit";

const initialState: Interfaces.AuthState = {
  isAuthenticated: typeof window !== "undefined" && !!localStorage.getItem("accessToken"),
  user: typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "null") : null,
  error: "",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.isAuthenticated = true;
      state.user = action.payload; 
      state.error = null;

      localStorage.setItem("user", JSON.stringify(action.payload));
    },
    loginFailure: (state, action) => {
      state.isAuthenticated = false;
      state.user = null;
      state.error = action.payload; 
    },
    registerSuccess: (state, action) => {
      state.isAuthenticated = true; // Giả định tự động đăng nhập sau khi đăng ký
      state.user = action.payload; 
      state.error = null;

      if (action.payload.token) {
        localStorage.setItem("accessToken", action.payload.token);
      }
    },
    registerFailure: (state, action) => {
      state.isAuthenticated = false;
      state.user = null;
      state.error = action.payload; 
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.error = null;

      clearAuthData()
      localStorage.removeItem("user");
    },
  },
});

export const { loginSuccess, loginFailure, logout, registerSuccess, registerFailure } = authSlice.actions;

export default authSlice.reducer;
