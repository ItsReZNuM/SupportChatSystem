import ChatRoomPageContent from "@/components/chatRoomPageContent/ChatRoomPageContent";
import { getCookie } from "@/utils/getCookie";

export async function generateMetadata({ params }) {
    const {roomId} = await params
    const res = await fetch(
        `http://localhost:8000/chat/conversations/conversation_info/${roomId}/`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${getCookie("access_token")}`,
                "Content-Type": "application/json",
            },
            cache: "no-store",
        },
    );
    const data = await res.json();

    return {
        title: data.conversation?.guest_display_name,
    };
}

export default async function ChatRoom({ params }) {
    const {roomId} = await params

    return <ChatRoomPageContent  param={roomId} />;
}
