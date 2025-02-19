import { createSlice } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";
import { marked } from "marked";
import DOMPurify  from "dompurify";

const initData: Interfaces.ChatState = {
    data: [],
};

const chatSlice = createSlice({
    name: "chat",
    initialState: initData,
    reducers: {
        addChat: (state, action) => {
            const newChat = action.payload || {
                id: uuidv4(),
                title: "Chat",
                messages: [],
            }
            state.data.push(newChat)
        },
        addMessage: (state, action) => {
            const {idChat, userMess, botMess, botMessageId, userMessageId, is_has_image, image_url} = action.payload
            const chat = state.data.find((chat) => chat.id === idChat)
            if (chat) {
                const messageFormat = marked.parse(botMess) as string
                const safeChat = DOMPurify.sanitize(messageFormat)
                const newMessage = [
                    ...chat.messages,
                    {id: userMessageId, text: userMess, isBot: false, is_has_image: is_has_image, image_url: image_url},
                    { 
                        id: botMessageId, 
                        text: safeChat, // Bắt đầu với nội dung rỗng
                        isBot: true, 
                        isTyping: true // Đánh dấu trạng thái đang gõ
                    },
                ]
                chat.messages = newMessage;
                state.data = [...state.data]
            }
        },
        loadChat: (state, action) => {
            state.data = action.payload;
        },
        setMessages: (state, action) => {
            const {chatId, messages} = action.payload
            const chat = state.data.find((chat) => chat.id === chatId)
            if (chat) {
                chat.id = chatId;
                chat.messages = messages;
            }
        },
        removeChat: (state, action) => {
            state.data = state.data.filter((chat) => chat.id !== action.payload);
        },
        setNameChat: (state, action) => {
            const {newTitle, chatId} = action.payload
            const chat = state.data.find((chat) => chat.id === chatId)
            if (chat) {
                chat.title = newTitle;
            }
        },
        updateMessage: (state, action) => {
            const { idChat, messageId, newText, botResponse } = action.payload;
            const chatIndex = state.data.findIndex((chat) => chat.id === idChat);
        
            if (chatIndex !== -1) {
                const updatedMessages = state.data[chatIndex].messages.map((msg, index, messages) => {
                    if (msg.id === messageId) {
                        // Cập nhật câu hỏi của user
                        return { ...msg, text: newText };
                    }
        
                    // Tìm tin nhắn bot ngay sau tin nhắn user
                    if (messages[index - 1]?.id === messageId && msg.isBot) {
                        return { ...msg, text: botResponse };
                    }
        
                    return msg;
                });
        
                // Cập nhật Redux state
                state.data[chatIndex] = {
                    ...state.data[chatIndex],
                    messages: updatedMessages,
                };
            }
        },
        resetChat(state) {
            state.data = []; 
        }
    }
})

export const { addChat, removeChat, addMessage, setNameChat, updateMessage, loadChat, setMessages, resetChat } = chatSlice.actions;

export default chatSlice.reducer