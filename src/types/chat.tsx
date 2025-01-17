export interface Chat {
    id: string;
    title: string;
}

export interface MessageDetail {
    id: string;
    text: string;
    isBot: boolean;
    isTyping?: boolean;
}

export interface Chatbot {
    id: string;
    title: string;
    messages: MessageDetail[];
    isRenamed: boolean
}

export interface ChatState {
    data: Chatbot[];
}