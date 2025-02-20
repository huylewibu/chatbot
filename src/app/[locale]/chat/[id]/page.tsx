'use client'

import RequireAuth from "@/app/components/RequireAuth";
import UserInfo from "@/app/components/UserInfo";
import { ToastContainer } from "react-toastify";
import { useEffect, useState } from "react";
import { APIService } from "@/app/services/APIServices";
import { clearAuthData } from "@/app/services/authService";
import ChatDetail from "@/app/pages/ChatDetail";

const ChatID = () => {
    const [userInfo, setUserInfo] = useState<Interfaces.UserInfoResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    const fetchChatInfo = async () => {
        APIService.getUserInfo((data, error) => {
            if (error) {
                clearAuthData();
                window.location.href = "/login";
            } else if (data) {
                setUserInfo(data);
            }
            setIsLoading(false); 
        });
    };

    useEffect(() => {
        fetchChatInfo();
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent border-solid rounded-full animate-spin"></div>
            </div>
        ) 
    }

    return (
        <RequireAuth>
            {userInfo && (
                <UserInfo>
                    <div className="h-screen flex">
                        <ToastContainer />
                        <ChatDetail />
                    </div>
                </UserInfo>
            )}
        </RequireAuth>
    );
}

export default ChatID;