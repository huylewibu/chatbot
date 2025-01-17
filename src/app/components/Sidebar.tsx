'use client';

import PropType from "prop-types";
import Image from "next/image";
import IconPlus from "../assets/plusIcon.png";
import IconChat from "../assets/chat.png";
import IconTrash from "../assets/remove.png";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { addChat, removeChat } from "../store/chatSlice/chatSlice";
import { v4 as uuidv4 } from "uuid";
import { RootState } from "../store/app";

interface SidebarProps {
    isOpen: boolean;
    toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
    const dispatch = useDispatch();
    const navigate = useRouter();
    const { data } = useSelector((state: RootState) => state.chat);

    const handleNewChat = () => {
        const newChat = {
            id: uuidv4(),
            title: "New chat",
            messages: [],
        };
        dispatch(addChat(newChat));
    };

    const handleRemoveChat = (id: string) => {
        dispatch(removeChat(id));
        navigate.push("/");
    };

    return (
        <div
            className={`fixed top-0 left-0 h-full bg-primaryBg-sidebar z-40 w-[260px] transform transition-transform duration-300 ${
                isOpen ? "translate-x-0" : "-translate-x-full"
            } xl:translate-x-0 xl:relative xl:z-auto`}
        >
            <div className="p-8">
                <button
                    className="px-4 py-2 flex items-center space-x-4 bg-gray-600 mb-10 text-xs"
                    onClick={handleNewChat}
                >
                    <Image src={IconPlus} alt="plus icon" className="h-4 w-4" />
                    <p>Cuộc trò chuyện mới</p>
                </button>
                <div className="space-y-4">
                    <p>Gần đây:</p>
                    <div className="flex flex-col space-y-6">
                        {data.map((chat) => (
                            <Link
                                className="flex items-center justify-between p-4 bg-gray-800"
                                key={chat?.id}
                                href={`/chat/${chat.id}`}
                            >
                                <div className="flex items-center space-x-4">
                                    <Image
                                        src={IconChat}
                                        alt="chat icon"
                                        className="w-8 h-8"
                                    />
                                    <p className="text-xs">{chat.title}</p>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleRemoveChat(chat.id);
                                    }}
                                >
                                    <Image
                                        src={IconTrash}
                                        alt="trash icon"
                                        className="w-5 h-5"
                                    />
                                </button>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

Sidebar.propTypes = {
    isOpen: PropType.bool.isRequired,
    toggleSidebar: PropType.func.isRequired,
};

export default Sidebar;
