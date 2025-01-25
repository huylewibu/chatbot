import axiosInstance from "../services/axiosInstance";

const APIClient = {
  get: async (
    url: string,
    completion: (data: string[] | null, error: Interfaces.HandelErrors | null) => void
  ) => {
    try {
      const response = await axiosInstance.get(url); // Sử dụng axiosInstance
      completion(response.data, null);
    } catch (error: any) {
      completion(null, normalizeError(error));
    }
  },

  post: async (
    url: string,
    data: string[] | null,
    completion: (data: string[] | null, error: Interfaces.HandelErrors | null) => void
  ) => {
    try {
      const response = await axiosInstance.post(url, data);
      completion(response.data, null);
    } catch (error: any) {
      completion(null, error);
    }
  },
};

const normalizeError = (error: Interfaces.HandelErrors) => {
  if (error.response && error.response.data) {
    return {
      code: error.response.data.code || "UNKNOWN_ERROR",
      message: error.response.data.message || "An unknown error occurred.",
    };
  }

  // Lỗi không có phản hồi từ server (lỗi mạng hoặc server không hoạt động)
  return {
    code: "NETWORK_ERROR",
    message: "Unable to connect to the server.",
  };
};

// const API_ENDPOINTS = {
//     ADMIN: `${API_BASE_URL}/admin`,
//     CHAT: `${API_BASE_URL}/api/chat/`,
//     RENAME_CHAT: `${API_BASE_URL}/api/chat/rename`,
//     UPDATE_CHAT: `${API_BASE_URL}/api/chat/update`,
//     AUTH_REGISTER: `${API_BASE_URL}/api/auth/register`,
//     AUTH_TOKEN: `${API_BASE_URL}/api/auth/token`,
//     AUTH_TOKEN_REFRESH: `${API_BASE_URL}/api/auth/token/refresh`,
//     AUTH_INFO: `${API_BASE_URL}/api/auth/info`,
// };



export default APIClient