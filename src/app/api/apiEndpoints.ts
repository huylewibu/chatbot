/* eslint-disable */
import axiosInstance from "../services/axiosInstance";

const APIClient = {
  get: async (
    url: string,
    completion: (data: string | null, error: Interfaces.HandelErrors | null) => void
  ) => {
    try {
      const response = await axiosInstance.get(url); // Sử dụng axiosInstance
      completion(response.data, null);
    } catch (error: unknown) {
      completion(null, normalizeError(error));
    }
  },

  post: async (
    url: string,
    data: string[],
    completion: (data: string | null, error: Interfaces.HandelErrors | null) => void
  ) => {
    try {
      const response = await axiosInstance.post(url, data);
      completion(response.data, null);
    } catch (error: unknown) {
      completion(null, normalizeError(error));
    }
  },
  delete: async (
    url: string,
    completion: (data: string | null, error: Interfaces.HandelErrors | null) => void
  ) => {
    try {
      const response = await axiosInstance.delete(url);
      completion(response.data, null);
    } catch (error: unknown) {
      completion(null, normalizeError(error));
    }
  },
};



function isHandelErrors(error: unknown): error is Interfaces.HandelErrors {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    "message" in error
  );
}

const normalizeError = (error: unknown): Interfaces.HandelErrors => {
  if (isHandelErrors(error)) {
    if (error.response && error.response.data) {
      return {
        code: error.response.data.code || "UNKNOWN_ERROR",
        message: error.response.data.message || "An unknown error occurred.",
      };
    }
  }

  // Lỗi không có phản hồi từ server (lỗi mạng hoặc server không hoạt động)
  return {
    code: "NETWORK_ERROR",
    message: "Unable to connect to the server.",
  };
};

export default APIClient