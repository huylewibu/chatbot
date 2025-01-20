import RequireAuth from "@/app/components/RequireAuth";
import UserInfo from "@/app/components/UserInfo";
import { ChatDetail } from "@/app/pages/ChatDetail";

const ChatID = () => {
    return ( 
        <RequireAuth>
            <UserInfo>
                <div className="h-screen flex">
                    <ChatDetail />
                </div>
            </UserInfo>
        </RequireAuth>
    );
}
 
export default ChatID;