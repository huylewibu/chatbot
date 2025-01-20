'use client'
import { ChatDetail } from "@/app/pages/ChatDetail";
import RequireAuth from "@/app/components/RequireAuth";
import axiosInstance from "@/app/services/axiosInstance";
import { useEffect, useState } from "react";
import API_ENDPOINTS from "@/app/api/apiEndpoints";
import UserInfo from "@/app/components/UserInfo";
import { clearAuthData } from "@/app/services/authService";

const ChatInfo: React.FC = () => {
    const [userInfo, setUserInfo] = useState(null);

    const fetchChatInfo = async () => {
        try {
            const response = await axiosInstance.get(API_ENDPOINTS.AUTH_INFO);
            setUserInfo(response.data);
        } catch (error) {
            console.log(error);
            clearAuthData()
            window.location.href = "/login";
        }
    };

    useEffect(() => {
        fetchChatInfo();
    }, []);

    if (!userInfo) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent border-solid rounded-full animate-spin"></div>
            </div>
        ) // Hiển thị trong khi chờ API
    }

    return (
        <RequireAuth>
            <UserInfo>
                <div className="h-screen flex">
                    <ChatDetail />
                </div>
            </UserInfo>
        </RequireAuth>
    );
};

export default ChatInfo;
