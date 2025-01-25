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
    loadChatApi(completion: (data: Interfaces.ChatResponse[] | null, error: Interfaces.HandelErrors | null) => void) {
        APIClient.get("/api/get-chat/", completion);
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

};