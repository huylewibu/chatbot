/* eslint-disable */
import APIClient from '../api/apiEndpoints'

export const APIService = {
    // Gọi API add đoạn chat
    addChatApi(
        data: Interfaces.AddChatRequest,
        completion: (data: Interfaces.AddChatResponse | null, error: Interfaces.HandelErrors | null) => void
    ) {
        APIClient.post("/api/add-chat/", data, completion);
    },
    // Gọi API chat
    chatApi(
        data: Interfaces.ChatRequest,
        completion: (data: Interfaces.ChatResponse | null, error: Interfaces.HandelErrors | null) => void
    ) {
        APIClient.post("/api/chat/", data, completion);
    },

    // Load Chat
    loadChatApi(completion: (data: Interfaces.LoadChatResponse | null, error: Interfaces.HandelErrors | null) => void) {
        APIClient.get("/api/get-chat/", completion);
    },

    // Get messages by chat
    getMessagesByChatApi(
        chatId: string,
        completion: (data: Interfaces.MessagesResponse | null, error: Interfaces.HandelErrors | null) => void
    ) {
        APIClient.get(`/api/get-messages/${chatId}`, completion);
    },

    // Remove Chat
    removeChatApi(
        chatId: string,
        completion: (data: Interfaces.RemoveChatResponse | null, error: Interfaces.HandelErrors | null) => void
    ) {
        APIClient.delete(`/api/chat/remove/${chatId}`, completion);
    },

    // Gọi API đổi tên chat
    renameChatApi(
        data: Interfaces.RenameChatRequest,
        completion: (data: Interfaces.RenameChatResponse | null, error: Interfaces.HandelErrors | null) => void
    ) {
        APIClient.post("/api/chat/rename", data, completion);
    },

    // Gọi API cập nhật tin nhắn
    updateMessageApi(
        data: Interfaces.UpdateMessageRequest,
        completion: (data: Interfaces.UpdateMessageResponse | null, error: Interfaces.HandelErrors | null) => void
    ) {
        APIClient.post("/api/chat/update", data, completion);
    },

    // Gọi API đăng ký
    registerApi(
        data: Interfaces.RegisterRequest,
        completion: (data: Interfaces.RegisterResponse | null, error: Interfaces.HandelErrors | null) => void
    ) {
        APIClient.post("/api/auth/register", data, completion);
    },

    // Gọi API lấy token đăng nhập
    getAuthToken(
        data: Interfaces.AuthTokenRequest,
        completion: (data: Interfaces.AuthTokenResponse | null, error: Interfaces.HandelErrors | null) => void
    ) {
        APIClient.post("/api/auth/token", data, completion);
    },

    // Gọi API lấy thông tin người dùng
    getUserInfo(
        completion: (data: Interfaces.UserInfoResponse | null, error: Interfaces.HandelErrors | null) => void
    ) {
        APIClient.get("/api/auth/info", completion); // Sử dụng APIClient.get
    },

    // Gọi API refresh token
    refreshToken(
        data: { refresh: string },
        completion: (data: { access: string } | null, error: Interfaces.HandelErrors | null) => void
    ) {
        APIClient.post("/api/auth/token/refresh", data, completion);
    },

    // Upload files
    uploadFileApi(
        formData: FormData,
        completion: (data: Interfaces.ChatResponse | null, error: Interfaces.HandelErrors | null) => void
    ) {
        APIClient.postForm("/api/upload-files/", formData, completion); // Sử dụng postForm thay vì post
    },

    // Generate image
    generateImageApi(
        data: { prompt: string },
        completion: (data: { image?: string; error?: string } | null, error: Interfaces.HandelErrors | null) => void
    ) {
        APIClient.post("/api/generate-image/", data, completion);
    },

};