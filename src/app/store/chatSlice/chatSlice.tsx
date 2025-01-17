import { createSlice } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";
import { marked } from "marked";
import DOMPurify  from "dompurify";
import { ChatState } from "@/types/chat";

const initData: ChatState = {
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
                messages: []
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
                chat.messages = newMessage;
                state.data = [...state.data]
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
        updateBotMessage: (state, action) => {
            const { idChat, messageId, newText, isTyping  } = action.payload
            const chat = state.data.find((chat) => chat.id === idChat)
            if (chat) {
                const message = chat.messages.find((msg) => msg.id === messageId)
                if (message && message.isBot) {
                    message.text = newText;
                    message.isTyping = isTyping;
                }
            }
        }
    }
})

export const { addChat, removeChat, addMessage, setNameChat, updateBotMessage } = chatSlice.actions;

export default chatSlice.reducer