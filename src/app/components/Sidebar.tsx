'use client';

import PropType from "prop-types";
import Image from "next/image";
import IconPlus from "../assets/plusIcon.png";
import IconChat from "../assets/chat.png";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { addChat, loadChat, removeChat, setNameChat } from "../store/chatSlice/chatSlice";
import { RootState } from "../store/app";
import { APIService } from "../services/APIServices";
import { useEffect, useMemo, useState } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { Params } from "next/dist/server/request/params";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

const Sidebar: React.FC<Interfaces.SidebarProps> = ({ isOpen }) => {
    const [menuOpen, setMenuOpen] = useState<string | null>(null);
    const [editingChatId, setEditingChatId] = useState<string | null>(null);
    const [newTitle, setNewTitle] = useState<string>("");
    const dispatch = useDispatch();
    const navigate = useRouter();
    const { user } = useSelector((state: RootState) => state.auth);
    const { data } = useSelector((state: RootState) => state.chat);
    const { id } = useParams<Params>();
    const { t } = useTranslation();
    const [search, setSearch] = useState<string>("");
    const [userChats, setUserChats] = useState<Interfaces.Chat[]>([]);

    useEffect(() => {
        if (!id) {
            APIService.loadChatApi((dataResponse, error) => {
                if (error) {
                    toast.error(t("error.load_chat", { error: error }), { autoClose: 3000, pauseOnHover: false });
                    return;
                }
                if (dataResponse) {
                    setUserChats(dataResponse.chats.filter(
                        (chat) => chat.username === user?.username
                    ));

                    dispatch(loadChat(userChats));
                }
            });
        }
    }, [id, dispatch]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuOpen) {
                const menuButton = document.querySelector(`[data-menu-id="${menuOpen}"]`);
                const menuDropdown = document.querySelector(`[data-dropdown-id="${menuOpen}"]`);

                if (
                    menuButton &&
                    !menuButton.contains(event.target as Node) &&
                    menuDropdown &&
                    !menuDropdown.contains(event.target as Node)
                ) {
                    setMenuOpen(null);
                }
            }
        };

        document.addEventListener("click", handleClickOutside);

        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, [menuOpen]);

    const debounce = (func: (...args: any[]) => void, delay: number) => {
        let timeoutId: NodeJS.Timeout;
        return (...args: any[]) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func(...args), delay);
        };
    };

    const handleSearchChat = (input: string) => {
        if (input.trim()) {
            const filteredChats = userChats.filter((chat) => chat.title.toLowerCase().includes(input.toLowerCase()));
            dispatch(loadChat(filteredChats));
        } else {
            dispatch(loadChat(userChats));
        }
    }

    const debouncedSearch = useMemo(() => debounce(handleSearchChat, 500), [userChats]);

    useEffect(() => {
        debouncedSearch(search);
    }, [search]);

    const handleSelectChat = async (chatId: string) => {
        navigate.push(`/chat/${chatId}`);
    }

    const handleNewChat = () => {
        // Gọi API từ backend
        APIService.addChatApi(
            { title: "New chat" },
            (response, error) => {
                if (error) {
                    toast.error(t("error.create_chat", { error: error.message }));
                    return;
                }

                if (response) {
                    const newChat = {
                        id: response.chat.id,
                        title: response.chat.title,
                        messages: [],
                    };
                    dispatch(addChat(newChat));
                    toast.success(t("success.create_chat"));
                    setTimeout(() => {
                        navigate.push(`/chat/${newChat.id}`);
                    }, 1000)
                }
            }
        );
    };

    const startRename = (chatId: string, currentTitle: string) => {
        setEditingChatId(chatId);
        setNewTitle(currentTitle); // Điền tên hiện tại vào input
    };

    // Lưu tên chat mới
    const saveRename = (chatId: string) => {
        if (!newTitle.trim()) {
            setEditingChatId(null); // Nếu tên trống, hủy chỉnh sửa
            return;
        }

        APIService.renameChatApi(
            { chat_id: chatId, message: undefined, new_title: newTitle.trim() },
            (response, error) => {
                if (error) {
                    toast.error(t("error.rename_chat", { error: error.message }));
                    return;
                }
                if (response) {
                    dispatch(setNameChat({ newTitle: newTitle.trim(), chatId })); // Cập nhật Redux store
                    setEditingChatId(null);
                    toast.success(t("success.rename_chat"));
                }
            }
        );
    };

    const handleRemoveChat = (chatIdToRemove: string) => {
        const currentChatId = id;
        APIService.removeChatApi(chatIdToRemove, (response, error) => {
            if (error) {
                toast.error(t("error.delete_chat", { error: error.message }), {
                    autoClose: 4000, pauseOnHover: false
                });
                return;
            }
            if (currentChatId === chatIdToRemove) {
                dispatch(removeChat(chatIdToRemove));
                navigate.push("/");
                toast.success(t("success.delete_chat_move_main_menu"), { autoClose: 4000, pauseOnHover: false });
            } else {
                dispatch(removeChat(chatIdToRemove));
                toast.success(t("success.delete_chat"), { autoClose: 4000, pauseOnHover: false });
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
                    <p>{t("Home")}</p>
                </Link>
                <div className="flex items-center space-x-2 relative">
                    <input
                        type="text"
                        placeholder={t("Tìm kiếm đoạn chat")}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full px-4 py-2 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 
                        focus:border-blue-500 outline-none transition duration-200 mb-5"
                    />
                </div>
                <button
                    className="px-4 py-2 flex items-center space-x-4 bg-gray-700 hover:bg-gray-600 text-white dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white transition-colors duration-300 mb-10 text-xs rounded-md"
                    onClick={handleNewChat}
                >
                    <Image src={IconPlus} alt="plus icon" className="h-4 w-4" />
                    <p>{t("Create a Conversation")}</p>
                </button>
                <div className="space-y-4">
                    <p>{t("Recently")}:</p>
                    <div className="flex flex-col space-y-6">
                        {data.map((chat) => (
                            <div key={chat?.id} className="relative">
                                <div
                                    className="flex cursor-pointer items-center justify-between p-4 bg-gray-800 hover:bg-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors duration-300 rounded-md"
                                    onClick={() => handleSelectChat(chat?.id)}
                                >
                                    <div className="flex items-center space-x-4">
                                        <Image src={IconChat} alt="chat icon" className="w-8 h-8" />
                                        {editingChatId === chat.id ? (
                                            <input
                                                type="text"
                                                value={newTitle}
                                                onChange={(e) => setNewTitle(e.target.value)}
                                                onBlur={() => saveRename(chat.id)} // Lưu khi mất focus
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        saveRename(chat.id); // Lưu khi nhấn Enter
                                                    }
                                                }}
                                                autoFocus
                                                className="w-full text-xs text-white bg-transparent border border-gray-500 rounded-md px-2 py-1 outline-none focus:border-blue-500 transition-colors duration-200"
                                            />
                                        ) : (
                                            <p className="text-xs text-white">{chat.title}</p>
                                        )}
                                    </div>
                                    <button
                                        data-menu-id={chat.id}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setMenuOpen(menuOpen === chat.id ? null : chat.id);
                                        }}
                                    >
                                        <BsThreeDotsVertical className="w-5 h-5 text-white" />
                                    </button>
                                </div>
                                {/* Dropdown menu */}
                                {menuOpen === chat.id && (
                                    <div
                                        data-dropdown-id={chat.id}
                                        className="absolute top-0 right-0 mt-2 z-[500] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg"
                                        style={{ transform: "translateX(100%)" }}
                                    >
                                        <button
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                            onClick={() => {
                                                startRename(chat.id, chat.title);
                                                setMenuOpen(null);
                                            }}
                                        >
                                            {t("Rename")}
                                        </button>
                                        <button
                                            className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                            onClick={() => {
                                                handleRemoveChat(chat.id);
                                                setMenuOpen(null);
                                            }}
                                        >
                                            {t("Delete")}
                                        </button>
                                    </div>
                                )}
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
