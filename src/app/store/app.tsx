import { configureStore } from "@reduxjs/toolkit";
import chatReducer from './chatSlice/chatSlice'
import authReducer from "./authSlice/authSlice";

const store = configureStore({
    reducer: {
        chat: chatReducer,
        auth: authReducer,
    }
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;