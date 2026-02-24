import { formatRoomLastMessageTime } from "@/utils/date";
import Link from "next/link";

export default function OpenChatsItem({
    cusName,
    lastMessageTime,
    problem,
    theme,
    no,
    chatURL
}) {
    return (
        <>
            <Link href={chatURL}
                className={`open-chats-item p-3 ${theme == "dark" ? "bg-gray-600" : "bg-gray-100"} rounded-lg flex items-center`}
            >
                <div className="dot size-3 bg-blue-500 rounded-full" />
                <div className="title-user mr-4">
                    <div
                        className={`title ${theme == "dark" ? "text-gray-100" : "text-gray-800"}  font-bold text-sm`}
                    >
                        {`${no} -- ${problem}`}
                    </div>
                    <div
                        className={`user text-xs ${theme == "dark" ? "text-gray-200" : "text-gray-500"} `}
                    >
                        {cusName}
                    </div>
                </div>
                <div
                    className={`time self-end ${theme == "dark" ? "text-gray-200" : "text-gray-500"} text-xs mr-auto`}
                >
                    {formatRoomLastMessageTime(lastMessageTime)}
                </div>
            </Link>
        </>
    );
}
