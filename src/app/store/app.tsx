/* eslint-disable */
import { configureStore } from "@reduxjs/toolkit";
import chatReducer from './chatSlice/chatSlice'
import authReducer from "./authSlice/authSlice";
import { createSelector } from "reselect";

const store = configureStore({
    reducer: {
        chat: chatReducer,
        auth: authReducer,
    }
})

const selectChats = (state: RootState) => state.chat.data;

export const selectChatById = createSelector(
    [selectChats, (_: RootState, id: string) => id],
    (chats, id) => chats.find(chat => chat.id === id) || null
);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;