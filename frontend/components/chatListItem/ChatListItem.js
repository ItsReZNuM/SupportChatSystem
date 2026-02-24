"use client";

import { useUIStore } from "@/store/uiStore";
import { formatRoomLastMessageTime } from "@/utils/date";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ChatListItem({
    cusName,
    sumMessage,
    roomURL,
    lastMessageTime
}) {
    const theme = useUIStore((s) => s.theme);
    const route = usePathname();

    return (
        <>
            <Link href={`/dashboard/chats/${roomURL}`}>
                <div
                    className={`chat-list-item w-full p-3 flex flex-col gap-2 mb-1  ${
                        route === `/dashboard/chats/${roomURL}`
                            ? theme == "dark"
                                ? "bg-gray-700"
                                : "bg-gray-100"
                            : theme == "dark"
                              ? "bg-gray-800"
                              : "bg-white"
                    }`}
                >
                <div className={`cus-name-last-msg-date flex items-center justify-between ${theme == "dark" ? "text-gray-100" : "text-gray-800"}`}>
                    <div
                        className={`cus-name text-sm font-bold`}
                    >
                        {cusName}
                    </div>
                        <div className="last-msg-date text-xs">
                            {formatRoomLastMessageTime(lastMessageTime)}
                        </div>
                </div>
                    <div
                        className={`sum-message ${theme == "dark" ? "text-gray-400" : "text-gray-600"} text-xs truncate`}
                    >
                        {sumMessage}
                    </div>
                </div>
            </Link>
        </>
    );
}
