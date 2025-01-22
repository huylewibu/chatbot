import { refreshAccessToken } from './authService';
import axios from "axios";

const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL, // Base URL của API
    headers: {
        "Content-Type": "application/json",
    },
});

// Interceptor để tự động thêm token vào request
axiosInstance.interceptors.request.use(
    async (config) => {
        const token = localStorage.getItem("accessToken");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor để refresh token nếu nhận lỗi 401
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            if (originalRequest.url !== "/api/auth/token") {
                try {
                    const newToken = await refreshAccessToken();
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return axiosInstance(originalRequest); // Gửi lại request với token mới
                } catch (err) {
                    // Token không thể làm mới, chuyển hướng đến login
                    window.location.href = "/login";
                    return Promise.reject(err);
                }
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
