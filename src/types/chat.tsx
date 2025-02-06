/* eslint-disable @typescript-eslint/no-unused-vars */
declare namespace Interfaces {
    interface HandelErrors {
        code: string
        message: string
        response?: ResponseError
    }

    interface ResponseError {
        data: {
            detail: string
            error: string
            code: string
            message: string
        }
    }

    interface AddChatRequest {
        title: string;
    }

    interface AddMessageRequest {
        chat_id: string
        message: string
        is_bot?: boolean
    }

    interface AddChatResponse {
        message: string
        chat: {
            id: string
            title: string
            username: string
            created_at: string
            updated_at: string
        }
    }

    interface LoadChatResponse {
        chats: {
            id: string
            title: string
            updated_at: string
            messages: string[]
        }[]
    }

    interface MessagesResponse {
        chat: {
            id: string,
            title: string,
            created_at: string,
            updated_at: string,
        }
        message_data: MessageData[]
    }

    interface MessageData {
        id: string,
        message: string,
        is_bot: boolean,
        sequence: number,
        created_at: string
    }

    interface Chat {
        id: string
        title: string
    }

    interface MessageDetail {
        id: string;
        text: string;
        isBot: boolean;
        isTyping?: boolean;
        pendingMessage?: string;
        sequence?: number;
    }

    interface SidebarProps {
        isOpen: boolean;
        toggleSidebar: () => void;
    }

    interface Chatbot {
        id: string;
        title: string;
        messages: MessageDetail[];
        isRenamed: boolean;
        idDb: number;
    }

    interface ChatState {
        data: Chatbot[];
    }

    interface EditMode {
        isEditing: boolean;
        messageId: string;
        text: string;
    }

    interface RemoveChatResponse {
        message: string
    }

    interface Login {
        username: string;
        password: string;
        email: string;
    }

    interface AuthState {
        isAuthenticated: boolean;
        user: { username: string } | null;
        error: HandelErrors | string | null;
    }

    interface AuthResponse {
        access_token: string;
        refresh_token: string;
        username: string;
    }

    interface JwtPayload {
        exp: number; // Thời gian hết hạn
        iat: number; // Thời gian tạo token
    }

    interface ChatRequest {
        chat_id: any;
        message: string;
        chat_history: ChatHistoryRequest[];
        image_base64?: string | null
    }

    interface ChatHistoryRequest {
        role: string;
        content: string;
    }

    interface ChatResponse {
        user_message: {
            created_at: string;
            id: string;
            message: string;
            is_bot: boolean;
        };
        bot_response: {
            message: string;
            id: string;
            is_bot: boolean;
            created_at: string;
        };
    }

    // API Rename Chat
    interface RenameChatRequest {
        message?: string;
        chat_id: any;
        new_title?: string;
    }

    interface RenameChatResponse {
        chat_name: string;
    }

    // API Update Message
    interface UpdateMessageRequest {
        chat_id: string;
        message_id: string;
        new_text: string;
        chat_history?: ChatHistoryRequest[];
    }

    interface UpdateMessageResponse {
        message_id: string;
        new_text: string;
        bot_response: string;
    }

    // API Register
    interface RegisterRequest {
        username: string;
        email: string;
        password: string;
    }

    interface RegisterResponse {
        message: string;
        username: string;
        access_token: string;
        refresh_token: string;
    }

    // API Get User Info
    interface UserInfoResponse {
        username: string;
        email: string;
        last_login: string | null;
    }

    interface AuthTokenRequest {
        username: string;
        password: string;
    }

    interface AuthTokenResponse {
        access: string;
        refresh: string;
        username: string;
        email: string;
        last_login: string;
    }
}
