'use client'

import ImgTemp from "../assets/temp.jpeg";
import IconMenu from "../assets/menu.png";
import IconStar from "../assets/star.png";
import Image from "next/image";
import Sidebar from "../components/Sidebar";
import { useParams, useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import './ChatDetail.css';
import { useEffect, useState } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { useDispatch, useSelector } from "react-redux";
import { addChat, addMessage, setNameChat, updateMessage } from "../store/chatSlice/chatSlice";
import { RootState } from "../store/app";
import { APIService } from "../services/APIServices";

export const ChatDetail = () => {
    const [inputChat, setInputChat] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
    const [editMode, setEditMode] = useState<Interfaces.EditMode>({ isEditing: false, messageId: "", text: "" });

    const { id } = useParams();
    const router = useRouter();
    const dispatch = useDispatch();

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const messageDetail: Interfaces.MessageDetail[] = useSelector((state: RootState) =>
        state.chat.data.find((chat: any) => chat.id === id)?.messages || []
    )

    const currentIdDb = useSelector((state: RootState) => 
        state.chat.data.find((chat: any) => chat.id === id)?.idDb
    )

    const handleEditClick = (messageId: string, currentText: string) => {
        setEditMode({ isEditing: true, messageId, text: currentText });
    };


    // Xử lý câu hỏi ban đầu nếu có `question` trong query string
    useEffect(() => {
        const initChat = async () => {
            if (!id) return;

            const queryParams = new URLSearchParams(window.location.search);
            const initialQuestion = queryParams.get("question");
            if (initialQuestion) {
                console.log("initialQuestion: ", id);
                try {
                    setIsLoading(true);
                    APIService.chatApi(
                        {
                            chat_id: id, // Thêm `chat_id` vào payload
                            message: initialQuestion,
                            chat_history: [], // Lịch sử chat ban đầu là rỗng
                        },

                        async (data, error) => {
                            setIsLoading(false);

                            if (error) {
                                console.error("Error processing initial question:", error);
                                return;
                            }

                            // Xử lý phản hồi từ bot
                            const botResponse = data?.bot_response || "Không nhận được phản hồi từ bot.";
                            // Kiểm tra nếu `botResponse` là object, chuyển đổi thành chuỗi
                            const botResponseText = typeof botResponse === "string" ? botResponse : JSON.stringify(botResponse);
                            const botResponseHTML = DOMPurify.sanitize(await marked.parse(botResponseText));
                            // Cập nhật Redux store
                            dispatch(
                                addMessage({
                                    idChat: id,
                                    userMess: initialQuestion,
                                    botMess: botResponseHTML,
                                    botMessageId: uuidv4(),
                                })
                            );
                        }
                    );
                } catch (err) {
                    console.error("Error processing initial question:", err);
                }
            }
        };
        initChat();

    }, [id, dispatch]);

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
                APIService.addChatApi({ title: "New chat" }, (response, error) => {
                    if (error) {
                        console.error("Error creating chat:", error.message);
                        setIsLoading(false);
                        return;
                    }

                    if (response) {
                        // Lấy ID từ API trả về
                        chatId = uuidv4();
                        const newChat = {
                            id: chatId,
                            title: response.chat.title,
                            messages: [], // Chưa có tin nhắn ban đầu
                            idDb: response.chat.id
                        };

                        // Thêm chat mới vào Redux store
                        dispatch(addChat(newChat));

                        APIService.renameChatApi(
                            { chat_id: response.chat.id, message: userMessage },
                            (renameResponse, renameError) => {
                                if (renameError) {
                                    console.log("Error renaming chat:", renameError.message);
                                    return;
                                }

                                // Cập nhật Redux store với tiêu đề mới
                                const newTitle = renameResponse?.chat_name || "New chat";
                                dispatch(setNameChat({ newTitle, chatId }));
                            }
                        );

                        router.push(`/chat/${chatId}?question=${encodeURIComponent(userMessage)}`);
                    }
                })
                return;
            }

            // Xử lý đổi tên khi đã tạo đoạn chat
            if (messageDetail.length === 0) {
                APIService.renameChatApi(
                    { chat_id: currentIdDb, message: userMessage },
                    (renameResponse, error) => {
                        if (error) {
                            console.error("Error renaming chat:", error);
                            return;
                        }
                        const newTitle = renameResponse?.chat_name || "Cuộc trò chuyện mới";
                        dispatch(setNameChat({ newTitle, chatId }));
                    }
                );
            }

            const formattedChatHistory = messageDetail.map((msg) => ({
                role: msg.isBot ? "assistant" : "user",
                content: msg.text,
            }));

            // Gửi tin nhắn đến backend
            APIService.chatApi(
                {
                    chat_id: chatId,
                    message: userMessage,
                    chat_history: formattedChatHistory,
                },
                async (response, error) => {
                    if (error) {
                        console.error("Error sending message:", error);
                        setIsLoading(false);
                        return;
                    }
                    const botResponse = response?.bot_response || "Không nhận được phản hồi từ bot.";
                    const botResponseHTML = DOMPurify.sanitize(await marked.parse(botResponse));
                    dispatch(
                        addMessage({
                            idChat: chatId,
                            userMess: userMessage,
                            botMess: botResponseHTML,
                            botMessageId: uuidv4(),
                        })
                    );
                }
            );

        } catch (err) {
            console.error("Error sending message:", err);
        } finally {
            setIsLoading(false);
        }
    };

    // Update câu hỏi
    const handleSaveEdit = async (idChat: string | string[]) => {
        if (!editMode.text.trim()) return;

        const chatId = Array.isArray(idChat) ? idChat[0] : idChat;

        try {
            const payload = {
                chat_id: chatId,
                message_id: editMode.messageId,
                new_text: editMode.text.trim(),
                chat_history: messageDetail.map((msg) => ({
                    role: msg.isBot ? "assistant" : "user",
                    content: msg.text,
                })),
            };

            APIService.updateMessageApi(payload, (response, error) => {
                if (error) {
                    console.error("Error updating message:", error);
                    return;
                }

                const { bot_response } = response || {};
                // Dispatch Redux để cập nhật state
                dispatch(updateMessage({
                    idChat: chatId,
                    messageId: editMode.messageId,
                    newText: editMode.text.trim(),
                    botResponse: bot_response,
                }));

                setEditMode({ isEditing: false, messageId: "", text: "" }); // Reset trạng thái chỉnh sửa
            });
        } catch (err) {
            console.error("Error updating message:", err);
        }
    };

    return (
        <div className="relative flex w-[100%]">
            {/* Sidebar */}
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

            {/* Nút mở Sidebar */}
            <button
                className={`fixed top-4 left-4 z-50 bg-gray-700 rounded-lg xl:hidden ${isSidebarOpen ? "hidden" : "block"
                    }`}
                onClick={toggleSidebar}
            >
            </button>

            {/* Nội dung chính */}
            <div
                className={`flex-1 transition-all duration-300 ${isSidebarOpen ? "ml-[260px] w-[500px]" : "ml-0"
                    } `}
            >
                <div className="flex items-center space-x-2 p-4">
                    <button onClick={toggleSidebar} className="xl:hidden">
                        <Image src={IconMenu} alt="menu icon" className="h-8 w-8" />
                    </button>
                </div>

                {/* Nội dung ứng dụng */}
                <div className="max-w-[90%] w-full mx-auto space-y-10">
                    {id ? (
                        <div className="chat-container flex flex-col space-y-4 p-4 h-[70vh] overflow-x-hidden overflow-y-auto">
                            {messageDetail.map((item) => (
                                <div
                                    className={`message-container ${item.isBot ? "bot" : "user"} mb-3`}
                                    key={item.id} // Key là duy nhất
                                >
                                    <div className={`message ${item.isBot ? "bot" : "user"}`}>
                                        {item.isBot ? (
                                            <>
                                                <Image src={IconStar} alt="star" className="w-8 h-8" />
                                                <p
                                                    dangerouslySetInnerHTML={{
                                                        __html: DOMPurify.sanitize(marked.parse(item.pendingMessage || "") as string),
                                                    }}
                                                ></p>
                                            </>
                                        ) : (
                                            <>
                                                {editMode.isEditing && editMode.messageId === item.id ? (
                                                    <div className="flex items-center space-x-3">
                                                        <input
                                                            type="text"
                                                            value={editMode.text}
                                                            onChange={(e) =>
                                                                setEditMode((prev) => ({
                                                                    ...prev,
                                                                    text: e.target.value,
                                                                }))
                                                            }
                                                            className="p-2 border rounded w-full bg-[#424242]"
                                                        />
                                                        <button
                                                            className="p-2 bg-green-500 text-white rounded"
                                                            onClick={() => handleSaveEdit(id)}
                                                        >
                                                            Save
                                                        </button>
                                                        <button
                                                            className="p-2 bg-gray-500 text-white rounded"
                                                            onClick={() =>
                                                                setEditMode({
                                                                    isEditing: false,
                                                                    messageId: "",
                                                                    text: "",
                                                                })
                                                            }
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center space-x-2">
                                                        <p>{item.text}</p>
                                                        <button
                                                            onClick={() =>
                                                                handleEditClick(item.id, item.text)
                                                            }
                                                            className="text-blue-500"
                                                        >
                                                            ✏️
                                                        </button>
                                                    </div>
                                                )}
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
                            className="p-4 rounded-lg bg-background text-black dark:text-white dark:bg-gray-800 w-[90%] border dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400"
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
