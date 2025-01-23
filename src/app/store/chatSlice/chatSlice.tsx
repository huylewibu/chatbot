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
                idDb: null
            }
            state.data.push(newChat)
        },
        addMessage: (state, action) => {
            const {idChat, userMess, botMess, botMessageId} = action.payload
            const chat = state.data.find((chat) => chat.id === idChat)
            if (chat) {
                const messageFormat = marked.parse(botMess) as string
                const safeChat = DOMPurify.sanitize(messageFormat)
                const newMessage = [
                    ...chat.messages,
                    {id: uuidv4(), text: userMess, isBot: false},
                    { 
                        id: botMessageId, 
                        text: "", // Bắt đầu với nội dung rỗng
                        isBot: true, 
                        pendingMessage: safeChat, // Lưu câu trả lời đầy đủ
                        isTyping: true // Đánh dấu trạng thái đang gõ
                    },
                ]
                console.log(newMessage)
                chat.messages = newMessage;
                state.data = [...state.data]
            }
        },
        loadChat: (state, action) => {
            state.data = action.payload;
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
                        return { ...msg, pendingMessage: botResponse };
                    }
        
                    return msg;
                });
        
                // Cập nhật Redux state
                state.data[chatIndex] = {
                    ...state.data[chatIndex],
                    messages: updatedMessages,
                };
            }
        }
    }
})

export const { addChat, removeChat, addMessage, setNameChat, updateMessage } = chatSlice.actions;

export default chatSlice.reducer