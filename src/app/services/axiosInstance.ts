import { refreshAccessToken } from './authService';
import axios from "axios";
import API_ENDPOINTS from "../api/apiEndpoints";

const axiosInstance = axios.create({
    baseURL: API_ENDPOINTS.CHAT, // Base URL của API
});

// Interceptor để tự động thêm token vào request
axiosInstance.interceptors.request.use(
    async (config) => {
        const token = localStorage.getItem("accessToken");
        console.log("Adding Access Token to request:", token);
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
        return Promise.reject(error);
    }
);

export default axiosInstance;
