'use client'

/* eslint-disable */
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
import { FiUpload } from "react-icons/fi";
import { handleImageUpload } from "../components/ImageUploader";
import MarkdownRenderer from "../components/MarkdownRenderer";

export const ChatDetail = () => {
    const [inputChat, setInputChat] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
    const [editMode, setEditMode] = useState<Interfaces.EditMode>({ isEditing: false, messageId: "", text: "" });
    const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const [textareaHeight, setTextareaHeight] = useState('auto');
    const [selectedImageBase64, setSelectedImageBase64] = useState<string[]>([]);
    const [imagePreview, setImagePreview] = useState<string[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const textarea = e.target;
        setInputChat(textarea.value);

        textarea.style.height = 'auto';

        const newHeight = Math.min(textarea.scrollHeight, 200); // Giới hạn tối đa 200px
        textarea.style.height = `${newHeight}px`;

        setTextareaHeight(`${newHeight}px`);
    };

    const { id } = useParams<Params>();
    const router = useRouter();
    const dispatch = useDispatch();

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const currentChatMessage = useSelector((state: RootState) => selectChatById(state, id as string));
    const messageDetail = currentChatMessage?.messages || [];

    useEffect(() => {
        scrollToBottom();
    }, [messageDetail]);

    const handleEditClick = (messageId: string, currentText: string) => {
        setEditMode({ isEditing: true, messageId, text: currentText });
    };

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    };

    const handlePasteImage = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
        const items = event.clipboardData.items;
        const base64Images: string[] = [];
        const previewUrls: string[] = [];

        for (let i = 0; i < items.length; i++) {
            const item = items[i];

            if (item.type.indexOf("image") !== -1) {
                const blob = item.getAsFile();
                if (blob) {
                    const reader = new FileReader();

                    reader.onload = () => {
                        const base64String = reader.result?.toString();
                        if (base64String) {
                            base64Images.push(base64String);

                            const previewUrl = URL.createObjectURL(blob);
                            previewUrls.push(previewUrl);

                            // Cập nhật state khi tất cả ảnh được xử lý
                            setImagePreview((prev: string[]) => [...prev, ...previewUrls]);
                            setSelectedImageBase64((prev: string[]) => [...prev, ...base64Images]);
                        }
                    };
                    reader.onerror = (error) => {
                        console.error("Error reading pasted image:", error);
                    };
                    reader.readAsDataURL(blob);
                }
            }
        }
    };

    const onImageSelected = (base64Images: string[]) => {
        setSelectedImageBase64((prev: string[]) => [...prev, ...base64Images]);

    }

    const handleRemoveImage = (index: number) => {
        setImagePreview((prev: string[]) => prev.filter((_, i) => i !== index));
        setSelectedImageBase64((prev: string[]) => prev.filter((_, i) => i !== index));

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
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
        if (!initialQuestion) {
            setInputChat("")
        }

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
                        { chat_id: chatId as string, message: messageToSend, new_title: undefined },
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
                setImagePreview([]);
                onImageSelected([]);
                APIService.chatApi(
                    {
                        chat_id: chatId as string,
                        message: messageToSend,
                        chat_history: formattedChatHistory,
                        image_base64: selectedImageBase64
                    },
                    async (response, error) => {
                        console.log("response", response);
                        if (error) {
                            console.error("Error sending message:", error);
                            return reject(error);
                        }
                        const botResponse = response?.bot_response.message || "Không nhận được phản hồi từ bot.";
                        // Nếu botResponse là object thì chuyển sang chuỗi
                        const botResponseText =
                            typeof botResponse === "string" ? botResponse : JSON.stringify(botResponse);
                        dispatch(
                            addMessage({
                                idChat: chatId,
                                userMess: messageToSend,
                                botMess: botResponseText,
                                botMessageId: response?.bot_response.id,
                                userMessageId: response?.user_message.id,
                                is_has_image: response?.user_message.is_has_image,
                                image_url: response?.user_message.image_url,
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
                            {messageDetail.length > 0 && messageDetail.map((item, index) => (
                                <div key={index} className="flex flex-col justify-between ">
                                    <div className="self-end">
                                        <div className="w-max-full w-fit">
                                            {item.is_has_image && item.image_url && (
                                                <div className="mt-2 mb-2">
                                                    <img
                                                        src={item.image_url}
                                                        alt="Uploaded Image"
                                                        className="rounded-xl object-cover"
                                                        style={{ width: "700px", height: "24rem" }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
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
                                                    <div className="markdown-content">
                                                        <MarkdownRenderer content={item.text || ""} />
                                                    </div>
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
                                                            <div className="whitespace-pre-wrap text-sm">
                                                                <MarkdownRenderer content={item.text || ""} />
                                                            </div>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>

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
                    <div className="pb-8" style={{ marginTop: "128px" }}>
                        <div className="font-primary relative z-50 w-full">
                            <div className="inset-x-0 mx-auto -mb-0.5 flex justify-center bg-transparent">
                                <div className="flex w-full max-w-6xl flex-col px-2.5" id="message-input-container">
                                    <div className="relative"></div>
                                    <div className="relative w-full"></div>
                                </div>
                            </div>
                            <div className="px-4">
                                <div className="max-w-6xl dynamic-textarea mx-auto inset-x-0 messageInput bg-[#F7F8FC] dark:bg-[#2A2A2A] dark:text-gray-100 svelte-zn7un9">
                                    <div>
                                        <input type="file" id="filesUpload" multiple style={{ display: 'none' }} />
                                        <div className="flex w-full gap-1.5" data-gtm-form-interact-id="0">
                                            <div className="flex-1 flex flex-col relative w-full rounded-3xl bg-[#F7F8FC] dark:bg-[#2A2A2A] dark:text-gray-100" dir="LTR" data-spm-anchor-id="5aebb161.686ec91.0.i9.26c8c921liSDnV">
                                                <div className="mx-1 mb-1 flex flex-wrap gap-2">
                                                    {imagePreview && imagePreview.map((preview, index) => (
                                                        <div key={index} className="group relative">
                                                            <div className="relative flex">
                                                                <img
                                                                    src={preview}
                                                                    alt={`Preview ${index}`}
                                                                    className="rounded-xl object-cover ml-3"
                                                                    style={{ width: "3.8rem", height: "3.8rem" }}
                                                                />
                                                            </div>
                                                            <div className="absolute -right-1 -top-1">
                                                                <button
                                                                    className="invisible rounded-full border border-white bg-gray-400 text-white transition group-hover:visible"
                                                                    type="button"
                                                                    onClick={() => handleRemoveImage(index)}
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                                                                        <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"></path>
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="flex">
                                                    <div
                                                        className={`spinner-overlay ${isLoading ? '' : 'hidden'}`}
                                                    >
                                                        <div className="loading-spinner"></div>
                                                    </div>
                                                    <textarea
                                                        ref={inputRef}
                                                        value={inputChat}
                                                        placeholder={isLoading ? "" : "Nhập câu hỏi tại đây"}

                                                        className="scrollbar-hidden bg-[#F7F8FC] dark:bg-[#2A2A2A] dark:text-gray-100 outline-none w-full rounded-xl pl-4 resize-none h-[24px] unicode"
                                                        rows={1}
                                                        onChange={handleTextareaChange}
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Enter" && !e.shiftKey) {
                                                                e.preventDefault();
                                                                handleChatDetail();
                                                            }
                                                        }}
                                                        onPaste={handlePasteImage}
                                                        disabled={isLoading}
                                                        style={{ height: textareaHeight }}
                                                    ></textarea>
                                                </div>
                                            </div>
                                            <div className="flex items-end w-10">
                                                <div className="flex items-center">
                                                    <div aria-label="Send message" className="flex">
                                                        <button
                                                            id="send-message-button"
                                                            onClick={handleChatDetail}
                                                            className="w-8 h-8 flex items-center justify-center self-center rounded-full transition bg-purple-500 text-white hover:bg-purple-600 dark:bg-purple-500 dark:text-white dark:hover:bg-purple-600"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                                                <path
                                                                    d="M12.9 18.45c0 .414-.336.75-.75.75s-.75-.336-.75-.75V7.36l-4.72 4.72c-.14.14-.33.22-.53.22s-.39-.08-.53-.22c-.14-.14-.22-.33-.22-.53s.08-.39.22-.53l6-6c.095-.095.208-.159.328-.193.107-.03.219-.035.328-.017.025.004.05.01.075.017.121.033.235.097.33.192l6 6c.14.14.22.33.22.53s-.08.39-.22.53c-.14.14-.33.22-.53.22s-.39-.08-.53-.22l-4.72-4.72V18.45z"
                                                                    fill="currentColor"
                                                                ></path>
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-3 flex items-center justify-between pl-4">
                                        <div className="flex items-center left-content">
                                            <>
                                                <label htmlFor="image-upload" className="cursor-pointer z-[500]"
                                                    style={{ top: "-2rem", right: "7.75rem" }}
                                                >
                                                    {/* Biểu tượng upload */}
                                                    <div className="flex">
                                                        <FiUpload className="w-6 h-6" />
                                                        <p>Upload image</p>
                                                    </div>
                                                </label>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    ref={fileInputRef}
                                                    multiple
                                                    id="image-upload"
                                                    style={{ display: "none" }}
                                                    onChange={(e) => handleImageUpload(e, onImageSelected, setImagePreview)}
                                                />
                                            </>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatDetail;
