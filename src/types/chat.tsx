namespace ChatApp {
    export interface Chat {
        id: string;
        title: string;
    }

    export interface MessageDetail {
        id: string;
        text: string;
        isBot: boolean;
        isTyping?: boolean;
        pendingMessage?: string;
    }

    export interface Chatbot {
        id: string;
        title: string;
        messages: MessageDetail[];
        isRenamed: boolean;
    }

    export interface ChatState {
        data: Chatbot[];
    }

    export interface EditMode {
        isEditing: boolean;
        messageId: string;
        text: string;
    }

    export interface Login {
        username: string;
        password: string;
        email: string;
    }

    export interface AuthState {
        isAuthenticated: boolean;
        user: { username: string } | null;
        error: string | null;
      }
}