'use client'

import ImgTemp from "../assets/temp.jpeg";
import IconMenu from "../assets/menu.png";
import IconStar from "../assets/star.png";
import Image from "next/image";
import Sidebar from "../components/Sidebar";
import { useParams, useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import './ChatDetail.css';
import { useEffect, useState } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { MessageDetail } from "@/types/chat";
import { useDispatch } from "react-redux";
import { addChat, addMessage, setNameChat } from "../store/chatSlice/chatSlice";
import API_ENDPOINTS from "../api/apiEndpoints";

export const ChatDetail = () => {
    const [messageDetail, setMessageDetail] = useState<MessageDetail[]>([]);
    const [inputChat, setInputChat] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { id } = useParams();
    const router = useRouter();
    const dispatch = useDispatch();

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    
    // Xử lý câu hỏi ban đầu nếu có `question` trong query string
    useEffect(() => {
        const initChat = async () => {
            if (!id) return;

            const queryParams = new URLSearchParams(window.location.search);
            const initialQuestion = queryParams.get("question");
            if (initialQuestion) {
                try {
                    const response = await axios.post(API_ENDPOINTS.CHAT, {
                        chat_id: id,
                        message: initialQuestion,
                        chat_history: [],
                    });

                    // Nhận phản hồi từ backend
                    const botResponse = response.data?.bot_response || "Không nhận được phản hồi từ bot.";
                    // Kiểm tra nếu `botResponse` là object, chuyển đổi thành chuỗi
                    const botResponseText = typeof botResponse === "string" ? botResponse : JSON.stringify(botResponse);
                    // Xử lý HTML an toàn
                    const botResponseHTML = DOMPurify.sanitize(await marked.parse(botResponseText));

                    // Cập nhật giao diện
                    setMessageDetail([
                        { id: uuidv4(), text: initialQuestion, isBot: false },
                        { id: uuidv4(), text: botResponseHTML, isBot: true },
                    ]);
                } catch (err) {
                    console.error("Error processing initial question:", err);
                }
            }
        };
        initChat();
    }, [id]);

    // Hàm xử lý gửi tin nhắn từ input
    const handleChatDetail = async () => {
        if (!inputChat.trim()) return;
        setIsLoading(true);

        const userMessage = inputChat.trim();
        setInputChat(""); // Reset input

        try {
            let chatId = id;

            if (!chatId) {
                // Tạo cuộc trò chuyện mới
                chatId = uuidv4();
                const newChat = {
                    id: chatId,
                    title: "Cuộc trò chuyện mới",
                    messages: [],
                };

                // Dispatch để thêm chat mới vào Redux store
                dispatch(addChat(newChat));
                
                const renameResponse = await axios.post(API_ENDPOINTS.RENAME_CHAT, {
                    message: userMessage,
                });
                const newTitle = renameResponse.data?.chat_name || "Cuộc trò chuyện mới";
                dispatch(setNameChat({ newTitle, chatId }));

                // Chuyển hướng đến chat mới
                router.push(`/chat/${chatId}?question=${encodeURIComponent(userMessage)}`);
                return; // Thoát hàm để xử lý initChat
            }

            if (messageDetail.length === 0) {
                const renameResponse = await axios.post(API_ENDPOINTS.RENAME_CHAT, {
                    message: userMessage,
                });
                const newTitle = renameResponse.data?.chat_name || "Cuộc trò chuyện mới";
                dispatch(setNameChat({ newTitle, chatId }));
            }

            const formattedChatHistory = messageDetail.map((msg) => ({
                role: msg.isBot ? "assistant" : "user",
                content: msg.text,
            }));
            // Gửi tin nhắn đến backend
            const response = await axios.post(API_ENDPOINTS.CHAT, {
                chat_id: chatId,
                message: userMessage,
                chat_history: formattedChatHistory,
            });
            const botResponse = response.data?.bot_response || "Không nhận được phản hồi từ bot.";
            // Kiểm tra nếu `botResponse` là object, chuyển đổi thành chuỗi
            const botResponseText = typeof botResponse === "string" ? botResponse : JSON.stringify(botResponse);
            // Xử lý HTML an toàn
            const botResponseHTML = DOMPurify.sanitize(await marked.parse(botResponseText));
            // Dispatch để thêm tin nhắn vào Redux store
            const botResponseParts = botResponseHTML.split(" ")
            let currentResponse = ""
            dispatch(
                addMessage({
                    idChat: chatId,
                    userMess: userMessage,
                    botMess: botResponseHTML,
                    botMessageId: uuidv4(),
                })
            );

            // Cập nhật giao diện
            setMessageDetail((prev) => [
                ...prev,
                { id: uuidv4(), text: userMessage, isBot: false },
                { id: uuidv4(), text: "", isBot: true },
            ]);

            botResponseParts.forEach((part, index) => {
                setTimeout(() => {
                    currentResponse += part + " "; // Thêm cụm từ và khoảng trắng
                    setMessageDetail((prev) => {
                        const newMessages = [...prev];
                        newMessages[newMessages.length - 1].text = currentResponse; // Cập nhật phần text của bot
                        return newMessages;
                    });
                }, index * 50); // Mỗi cụm từ hiển thị sau 150ms (tùy chỉnh tốc độ)
            });

        } catch (err) {
            console.error("Error sending message:", err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative flex w-[100%]">
            {/* Sidebar */}
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
    
            {/* Nút mở Sidebar */}
            <button
                className={`fixed top-4 left-4 z-50 bg-gray-700 rounded-lg xl:hidden ${
                    isSidebarOpen ? "hidden" : "block"
                }`}
                onClick={toggleSidebar}
            >
            </button>
    
            {/* Nội dung chính */}
            <div
                className={`flex-1 transition-all duration-300 ${
                    isSidebarOpen ? "ml-[260px] w-[500px]" : "ml-0"
                } `}
            >
                <div className="flex items-center space-x-2 p-4">
                    <button onClick={toggleSidebar} className="xl:hidden">
                        <Image src={IconMenu} alt="menu icon" className="h-8 w-8" />
                    </button>
                    <h1 className="text-ml uppercase font-bold">Vua Chat Solomon</h1>
                </div>
    
                {/* Nội dung ứng dụng */}
                <div className="max-w-[90%] w-full mx-auto space-y-10">
                    {id ? (
                        <div className="chat-container flex flex-col space-y-4 p-4 h-[70vh] overflow-x-hidden overflow-y-auto">
                            {messageDetail.map((item) => (
                                <div className={`message-container ${item.isBot ? "bot" : "user"} mb-3`} key={item.id}>
                                    <div className={`message ${item.isBot ? "bot" : "user"}`}>
                                        {item.isBot ? (
                                            <>
                                                <Image src={IconStar} alt="star" className="w-8 h-8" />
                                                <p dangerouslySetInnerHTML={{ __html: item.text }}></p>
                                            </>
                                        ) : (
                                            <>
                                                <p>User U&I</p>
                                                <p>{item.text}</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col space-y-5">
                            <div className="space-y-1">
                                <h2 className="bg-gradient-to-r from-blue-600 via-green-500 to-indigo-400 text-[30px] inline-block text-transparent bg-clip-text font-bold">
                                    Xin Chào
                                </h2>
                                <p className="text-3xl">Hôm nay tôi có thể giúp gì cho bạn?</p>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-[200px] h-[200px] bg-primaryBg-sidebar flex items-center justify-center rounded-lg">
                                    <p>Trở thành bá chủ Gacha</p>
                                </div>
                                <div className="w-[200px] h-[200px] bg-primaryBg-sidebar flex items-center justify-center rounded-lg">
                                    <p>Isekai chọn Class nào?</p>
                                </div>
                                <div className="w-[200px] h-[200px] bg-primaryBg-sidebar flex items-center justify-center rounded-lg">
                                    <p>Tớ muốn ăn tuỵ của cậu</p>
                                </div>
                                <div className="w-[200px] h-[200px] bg-primaryBg-sidebar flex items-center justify-center rounded-lg flex-col">
                                    <p>Chủ guild U&I là ai?</p>
                                    <Image
                                        src={ImgTemp}
                                        alt="temp img"
                                        className="w-[150px] h-[150px]"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="flex items-center space-x-4 w-full">
                        <input
                            type="text"
                            value={inputChat}
                            placeholder="Nhập câu hỏi tại đây"
                            className="p-4 rounded-lg bg-background w-[90%] border"
                            onChange={(e) => setInputChat(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleChatDetail();
                                }
                            }}
                            disabled={isLoading}
                        />
                        <button
                            className={`p-4 rounded-lg bg-green-500 text-white flex items-center justify-center ${isLoading ? "loading" : ""}`}
                            onClick={handleChatDetail}
                        >
                            <span>Gửi</span>
                            {isLoading && <div className="loading-spinner"></div>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
    
};

export default ChatDetail;
