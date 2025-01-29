'use client';

import PropType from "prop-types";
import Image from "next/image";
import IconPlus from "../assets/plusIcon.png";
import IconChat from "../assets/chat.png";
import IconTrash from "../assets/remove.png";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { addChat, loadChat, removeChat, setMessages } from "../store/chatSlice/chatSlice";
import { RootState } from "../store/app";
import { APIService } from "../services/APIServices";
import { useEffect } from "react";
import { Params } from "next/dist/server/request/params";

const Sidebar: React.FC<Interfaces.SidebarProps> = ({ isOpen }) => {
    const dispatch = useDispatch();
    const navigate = useRouter();
    const { data } = useSelector((state: RootState) => state.chat);
    const { id } = useParams<Params>();

    useEffect(() => {
        if (!id) {
            APIService.loadChatApi((dataResponse, error) => {
                if (error) {
                    console.error("Error loading chats:", error);
                    return;
                }
                if (dataResponse) {
                    const formattedChats = dataResponse.chats.map((chat) => ({
                        ...chat,
                        messages: chat.messages || [],
                    }));
                    dispatch(loadChat(formattedChats));
                }
            });
        }
    }, [id, dispatch]);

    const handleSelectChat = async (chatId: string) => {
        await APIService.getMessagesByChatApi(chatId, (data, error) => {
            if (error) {
                console.error("Error loading messages:", error);
                return;
            }
            if (data) {
                const formattedMessages = data.message_data.map((message) => ({
                    chatId,
                    id: message.id,
                    text: message.message,
                    isBot: message.is_bot,
                    createdAt: message.created_at,
                    sequence: message.sequence,
                }));
                dispatch(setMessages({ chatId, messages: formattedMessages }));
                navigate.push(`/chat/${chatId}`);
            }
        })
    }

    const handleNewChat = () => {
        // Gọi API từ backend
        APIService.addChatApi(
            { title: "New chat" },
            (response, error) => {
                if (error) {
                    console.error("Error creating chat:", error.message);
                    return;
                }

                if (response) {
                    console.log("response: ", response)
                    const newChat = {
                        id: response.chat.id,
                        title: response.chat.title,
                        messages: [],
                    };
                    dispatch(addChat(newChat));
                    navigate.push(`/chat/${newChat.id}`);
                }
            }
        );
    };

    const handleRemoveChat = (id: string) => {
        APIService.removeChatApi(id, (response, error) => {
            if (error) {
                console.error("Error removing chat:", error);
                return;
            }
            if (response) {
                dispatch(removeChat(id));
                navigate.push("/");
            }
        })
    };

    return (
        <div
            className={`fixed top-0 left-0 h-full bg-primaryBg-sidebar z-40 w-[260px] transform transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full"
                } xl:translate-x-0 xl:relative xl:z-auto`}
        >
            <div className="p-8">
                <Link
                    href="/chat/info"
                    className="px-3 py-2 mb-4 inline-flex items-center bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 text-ml text-gray-800 dark:text-gray-300 rounded-md transition duration-200"
                >
                    <p>Trang chủ</p>
                </Link>

                <button
                    className="px-4 py-2 flex items-center space-x-4 bg-gray-700 hover:bg-gray-600 text-white dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white transition-colors duration-300 mb-10 text-xs rounded-md"
                    onClick={handleNewChat}
                >
                    <Image src={IconPlus} alt="plus icon" className="h-4 w-4" />
                    <p>Cuộc trò chuyện mới</p>
                </button>
                <div className="space-y-4">
                    <p>Gần đây:</p>
                    <div className="flex flex-col space-y-6">
                        {data.map((chat) => (
                            <div key={chat?.id} className="flex cursor-pointer items-center justify-between p-4 bg-gray-800 hover:bg-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors duration-300 rounded-md"
                                onClick={() => handleSelectChat(chat?.id)}>
                                <div className="flex items-center space-x-4">
                                    <Image src={IconChat} alt="chat icon" className="w-8 h-8" />
                                    <p className="text-xs text-white">{chat.title}</p>
                                </div>
                                <button onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleRemoveChat(chat.id);
                                }}>
                                    <Image src={IconTrash} alt="trash icon" className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

Sidebar.propTypes = {
    isOpen: PropType.bool.isRequired,
    toggleSidebar: PropType.func.isRequired,
};

export default Sidebar;
