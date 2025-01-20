import axios from "axios";
import API_ENDPOINTS from "../api/apiEndpoints";
import { jwtDecode } from "jwt-decode";


// Làm mới token
export const refreshAccessToken = async () => {
  const refresh = localStorage.getItem("refreshToken");
  if (!refresh) throw new Error("No refresh token found");

  const response = await axios.post(API_ENDPOINTS.AUTH_TOKEN_REFRESH, { refresh });
  const { access } = response.data;

  // Cập nhật access token mới
  localStorage.setItem("accessToken", access);

  return access;
};

export const isAuthenticated = () => {
  const token = localStorage.getItem("accessToken");
  if (!token) return false;

  try {
      const decoded: any = jwtDecode(token);
      const currentTime = Date.now() / 1000; // Thời gian hiện tại tính bằng giây
      if (decoded.exp < currentTime) {
          localStorage.removeItem("accessToken"); // Xóa token hết hạn
          localStorage.removeItem("refreshToken");
          return false;
      }
      return true;
  } catch (error) {
      return false; // Token không hợp lệ
  }
};

export const clearAuthData = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
};