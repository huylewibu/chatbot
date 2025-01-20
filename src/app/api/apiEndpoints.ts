const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

const API_ENDPOINTS = {
    ADMIN: `${API_BASE_URL}/admin`,
    CHAT: `${API_BASE_URL}/api/chat/`,
    RENAME_CHAT: `${API_BASE_URL}/api/chat/rename`,
    UPDATE_CHAT: `${API_BASE_URL}/api/chat/update`,
    AUTH_REGISTER: `${API_BASE_URL}/api/auth/register`,
    AUTH_TOKEN: `${API_BASE_URL}/api/auth/token`,
    AUTH_TOKEN_REFRESH: `${API_BASE_URL}/api/auth/token/refresh`,
    AUTH_INFO: `${API_BASE_URL}/api/auth/info`,
};

export default API_ENDPOINTS;