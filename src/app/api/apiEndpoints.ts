const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

const API_ENDPOINTS = {
    CHAT: `${API_BASE_URL}/api/chat/`,
    ADMIN: `${API_BASE_URL}/admin`,
    RENAME_CHAT: `${API_BASE_URL}/api/chat/rename/`,
};

export default API_ENDPOINTS;