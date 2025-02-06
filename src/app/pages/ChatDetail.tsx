'use client'

import ImgTemp from "../assets/temp.jpeg";
import IconMenu from "../assets/menu.png";
import IconStar from "../assets/star.png";
import Image from "next/image";
import Sidebar from "../components/Sidebar";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { useDispatch, useSelector } from "react-redux";
import { addChat, addMessage, setNameChat, updateMessage } from "../store/chatSlice/chatSlice";
import { RootState, selectChatById } from "../store/app";
import { APIService } from "../services/APIServices";
import { Params } from "next/dist/server/request/params";
import { GoPencil } from "react-icons/go";
import './ChatDetail.css';
import ImageUploader from "../components/ImageUploader";

export const ChatDetail = () => {
    const [inputChat, setInputChat] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
    const [selectedImageBase64, setSelectedImageBase64] = useState<string | null>(null);
    const [editMode, setEditMode] = useState<Interfaces.EditMode>({ isEditing: false, messageId: "", text: "" });
    const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const [textareaHeight, setTextareaHeight] = useState('auto'); // State để theo dõi chiều cao của textarea

    const handleTextareaChange = (e: any) => {
        setInputChat(e.target.value);
        e.target.style.height = "auto"; // Reset height to auto
        e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`; // Set new height
        setTextareaHeight(e.target.style.height); // Cập nhật state với chiều cao mới
        scrollToBottom();
    };

    const { id } = useParams<Params>();
    const router = useRouter();
    const dispatch = useDispatch();

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const currentChatMessage = useSelector((state: RootState) => selectChatById(state, id));
    const messageDetail = currentChatMessage?.messages || [];

    const handleEditClick = (messageId: string, currentText: string) => {
        setEditMode({ isEditing: true, messageId, text: currentText });
    };

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messageDetail]);

    useEffect(() => {
        console.log("selectedImageBase64: ", selectedImageBase64);
    }, [selectedImageBase64]);

    const handlePaste = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
        const items = event.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.type.indexOf("image") !== -1) {
                const blob = item.getAsFile();
                if (blob) {
                    const reader = new FileReader();
                    reader.onload = () => {
                        const base64String = reader.result?.toString().split(',')[1];
                        setSelectedImageBase64(base64String || null);
                    };
                    reader.onerror = (error) => {
                        console.error("Error reading pasted image:", error);
                    };
                    reader.readAsDataURL(blob);
                }
            }
        }
    };

    // Hàm xử lý gửi tin nhắn từ input
    const handleChatDetail = async () => {
        // Kiểm tra query string để lấy câu hỏi ban đầu (nếu có)
        const queryParams = new URLSearchParams(window.location.search);
        const initialQuestion = queryParams.get("question");

        // Nếu có câu hỏi trong query string thì ưu tiên sử dụng, nếu không thì dùng từ textarea
        const messageToSend = initialQuestion || inputChat.trim();
        if (!messageToSend && !selectedImageBase64) return;

        setIsLoading(true);
        // Nếu đang gửi từ textarea thì xóa nội dung (để tránh gửi lại khi đã lưu trong query string)
        if (!initialQuestion) setInputChat("");

        let chatId = id;

        try {
            // Nếu chưa có chat id (đang ở trang chủ) thì tạo cuộc trò chuyện mới
            if (!chatId) {
                chatId = await new Promise<string>((resolve, reject) => {
                    APIService.addChatApi({ title: "New chat" }, (response, error) => {
                        if (error) {
                            console.error("Error creating chat:", error.message);
                            setIsLoading(false);
                            return reject(error);
                        }
                        if (response) {
                            // Cập nhật Redux store với chat mới
                            dispatch(
                                addChat({
                                    id: response.chat.id,
                                    title: response.chat.title,
                                    messages: [],
                                })
                            );
                            resolve(response.chat.id);
                        }
                    });
                });
                // Sau khi tạo chat mới, chuyển hướng người dùng sang trang chat mới (loại bỏ query param nếu cần)
                router.push(`/chat/${chatId}`);
            }

            // Nếu tin nhắn là tin đầu tiên của cuộc trò chuyện, tiến hành đổi tên chat sau 5 giây
            if (messageDetail.length === 0) {
                setTimeout(() => {
                    APIService.renameChatApi(
                        { chat_id: chatId, message: messageToSend, new_title: undefined },
                        (renameResponse, error) => {
                            if (error) {
                                console.error("Error renaming chat:", error);
                                return;
                            }
                            const newTitle = renameResponse?.chat_name || "Cuộc trò chuyện mới";
                            dispatch(setNameChat({ newTitle, chatId }));
                        }
                    );
                }, 5000);
            }

            // Định dạng lịch sử chat nếu có
            const formattedChatHistory = messageDetail.map((msg) => ({
                role: msg.isBot ? "assistant" : "user",
                content: msg.text,
            }));

            // Reset chiều cao của textarea
            if (inputRef.current) {
                inputRef.current.style.height = "";
            }

            // Gọi API gửi tin nhắn (dù là câu hỏi ban đầu hay tin nhắn từ textarea)
            await new Promise<void>((resolve, reject) => {
                APIService.chatApi(
                    {
                        chat_id: chatId,
                        message: messageToSend,
                        chat_history: formattedChatHistory,
                        image_base64: selectedImageBase64
                    },
                    async (response, error) => {
                        if (error) {
                            console.error("Error sending message:", error);
                            return reject(error);
                        }
                        const botResponse = response?.bot_response.message || "Không nhận được phản hồi từ bot.";
                        // Nếu botResponse là object thì chuyển sang chuỗi
                        const botResponseText =
                            typeof botResponse === "string" ? botResponse : JSON.stringify(botResponse);
                        const botResponseHTML = DOMPurify.sanitize(await marked.parse(botResponseText));
                        dispatch(
                            addMessage({
                                idChat: chatId,
                                userMess: messageToSend,
                                botMess: botResponseHTML,
                                botMessageId: response?.bot_response.id,
                                userMessageId: response?.user_message.id,
                            })
                        );
                        setIsLoading(false);
                        resolve();
                    }
                );
            });
        } catch (err) {
            console.error("Error in handleChatDetail:", err);
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
                    message_id: msg.id,
                })),
            };

            APIService.updateMessageApi(payload, (response, error) => {
                if (error) {
                    console.error("Error updating message:", error);
                    return;
                }

                const { bot_response } = response || {};
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
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
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
                            {/* .slice().sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0) */}
                            {messageDetail.length > 0 && messageDetail.map((item) => (
                                <div
                                    className={`message-container ${item.isBot ? "bot" : "user"} mb-3`}
                                    key={item.id}
                                    onMouseEnter={() => !item.isBot && setHoveredMessageId(item.id)}
                                    onMouseLeave={() => setHoveredMessageId(null)}
                                >
                                    {!item.isBot && hoveredMessageId === item.id && !editMode.isEditing && (
                                        <button
                                            onClick={() =>
                                                handleEditClick(item.id, item.text)
                                            }
                                            className="text-blue-500 hover:bg-gray-700 h-[20px]"
                                        >
                                            <GoPencil />
                                        </button>
                                    )}
                                    <div className={`message ${item.isBot ? "bot" : "user"}`}
                                        style={!item.isBot && editMode.isEditing && editMode.messageId === item.id ? { width: "100%" } : {}}
                                    >
                                        {item.isBot ? (
                                            <>
                                                <Image src={IconStar} alt="star" className="w-8 h-8" />
                                                <p
                                                    dangerouslySetInnerHTML={{
                                                        __html: DOMPurify.sanitize(marked.parse(item.text || "") as string),
                                                    }}
                                                ></p>
                                            </>
                                        ) : (
                                            <>
                                                {editMode.isEditing && editMode.messageId === item.id ? (
                                                    <div className="items-center space-x-3 w-full">
                                                        <textarea
                                                            ref={inputRef}
                                                            value={editMode.text}
                                                            style={{
                                                                minHeight: "30px",
                                                                height: `${Math.min(Math.max(inputRef.current?.scrollHeight || 50, 50), 208)}px`,
                                                                maxHeight: "208px",
                                                            }}
                                                            className="p-2 w-full bg-[#333333] resize-y overflow-y-auto"
                                                            onChange={(e) => {
                                                                setEditMode((prev) => ({
                                                                    ...prev,
                                                                    text: e.target.value,
                                                                }))
                                                            }}
                                                        />
                                                        <div className="flex justify-end space-x-2 mt-2">
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
                                                    </div>
                                                ) : (
                                                    <div className="relative flex w-full min-w-0 flex-col">
                                                        <div className="whitespace-pre-wrap text-sm"
                                                            dangerouslySetInnerHTML={{
                                                                __html: DOMPurify.sanitize(marked.parse(item.text || "") as string),
                                                            }}
                                                        ></div>

                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>

                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                    ) : (
                        <div className="flex flex-col space-y-5">
                            <div className="space-y-1">
                                <h2 className="bg-gradient-to-r from-blue-600 via-green-500 to-indigo-400 text-[30px] inline-block text-transparent bg-clip-text font-bold">
                                    Xin Chào
                                </h2>
                                <p className="text-3xl">Hôm nay tôi có thể giúp gì cho bạn?</p>
                            </div>
                            <div className="flex items-center space-x-3" style={{ marginBottom: "100px" }}>
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
                    <div className="flex items-center space-x-4 w-full textarea-container">
                        <div className="flex flex-col-reverse w-full relative">
                            {isLoading && (
                                <div className="absolute top-[30px] left-[10px] right-[10px] transform -translate-y-1/2 
                                text-white p-2 rounded-full transition-all 
                                w-[40px] h-[40px] flex items-center justify-center z-[500]">
                                    <div className="animate-spin h-5 w-5 border-4 border-white border-t-transparent rounded-full"></div>
                                </div>
                            )}
                            <div className="w-full h-[70px] relative" style={{ height: textareaHeight }}>
                                <ImageUploader
                                    onImageSelected={(base64) => setSelectedImageBase64(base64)}
                                />
                                <textarea
                                    ref={inputRef}
                                    rows={1}
                                    value={inputChat}
                                    placeholder={isLoading ? "" : "Nhập câu hỏi tại đây"}
                                    className="p-4 rounded-lg bg-background text-black 
                                            dark:text-white dark:bg-gray-800 w-[90%] max-h-[300px]
                                            dark:border-gray-600 placeholder-gray-500 border
                                            dark:placeholder-gray-400 resize-none overflow-y-auto 
                                            break-words border-gray-200 dark:border-gray-600"
                                    style={{
                                        minHeight: "57.6px",
                                        height: "100%",
                                    }}
                                    onChange={handleTextareaChange}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault();
                                            handleChatDetail();
                                        }
                                    }}
                                    onPaste={handlePaste}
                                    disabled={isLoading}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatDetail;
