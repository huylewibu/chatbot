import { jwtDecode } from "jwt-decode";
import { APIService } from "./APIServices";


// Làm mới token
export const refreshAccessToken = async () => {
  const refresh = localStorage.getItem("refreshToken");
  if (!refresh) throw new Error("No refresh token found");

  return new Promise((resolve, reject) => {
    APIService.refreshToken(
      { refresh },
      (data, error) => {
        if (error || !data) {
          reject(new Error("Failed to refresh token"));
          return;
        }

        const { access } = data;

        // Lưu token mới
        localStorage.setItem("accessToken", access);
        resolve(access);
      }
    );
  });
};

export const isAuthenticated = () => {
  const token = localStorage.getItem("accessToken");
  if (!token) return false;

  try {
    const decoded: Interfaces.JwtPayload = jwtDecode(token);
    const currentTime = Date.now() / 1000; // Thời gian hiện tại tính bằng giây
    if (decoded.exp < currentTime) {
      localStorage.removeItem("accessToken"); // Xóa token hết hạn
      localStorage.removeItem("refreshToken");
      return false;
    }
    return true;
  } catch (error) {
    console.error(error)
    return false; // Token không hợp lệ
  }
};

export const clearAuthData = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
};