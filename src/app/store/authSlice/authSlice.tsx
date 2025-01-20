import { clearAuthData } from "@/app/services/authService";
import { createSlice } from "@reduxjs/toolkit";

const initialState: ChatApp.AuthState = {
  isAuthenticated: typeof window !== "undefined" && !!localStorage.getItem("accessToken"),
  user: typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "null") : null,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.isAuthenticated = true;
      state.user = action.payload; // payload chứa thông tin người dùng
      state.error = null;

      localStorage.setItem("user", JSON.stringify(action.payload));
    },
    loginFailure: (state, action) => {
      state.isAuthenticated = false;
      state.user = null;
      state.error = action.payload; // payload chứa lỗi
    },
    registerSuccess: (state, action) => {
      state.isAuthenticated = true; // Giả định tự động đăng nhập sau khi đăng ký
      state.user = action.payload; // payload chứa thông tin người dùng
      state.error = null;

      if (action.payload.token) {
        localStorage.setItem("accessToken", action.payload.token);
      }
    },
    registerFailure: (state, action) => {
      state.isAuthenticated = false;
      state.user = null;
      state.error = action.payload; // payload chứa lỗi
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
