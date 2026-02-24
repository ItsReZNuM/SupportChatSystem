'use client'

import ChatWidget from "@/components/chatWidget/ChatWidget";
import ClientChatScreen from "@/components/clientChatScreen/ClientChatScreen";
import { useUIStore } from "@/store/uiStore";

export default function Home() {

    const chatWidgetState = useUIStore((state)=> state.chatWidgetState)
    const openChatWidget = useUIStore((state)=> state.openChatWidget)
    const closeChatWidget = useUIStore((state)=> state.closeChatWidget)
    return (
        <>
            <div className="bg-gray-900 h-svh"></div>
            <ClientChatScreen closeChatWidget={closeChatWidget} chatWidgetState={chatWidgetState} />
            <ChatWidget openChatWidget={openChatWidget} chatWidgetState={chatWidgetState} />
        </>
    );
}
