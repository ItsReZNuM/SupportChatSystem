"use client";

import { faCircleLeft, faTicket } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";
import ProblemLabel from "../problemLabel/ProblemLabel";
import FaildToFetchData from "../faildToFetchData/FaildToFetchData";

export default function ChatRoomHeader({
    theme,
    cusname,
    problemLabel,
    status,
    closeTicketHandler,
    disabled,
}) {
    const router = useRouter();
    return (
        <>
            <div
                className={`chatroom-header ${theme == "dark" ? "bg-gray-800 border-gray-600" : "bg-white border-gray-200"} border-b p-3`}
            >
                <div className="cus-name-and-closebtn flex justify-between items-center">
                    {status === "pending" ? (
                        <div
                            className={`h-4 w-24 rounded-md animate-pulse ${
                                theme === "dark" ? "bg-gray-700" : "bg-gray-300"
                            }`}
                        />
                    ) : status === "success" ? (
                        <div
                            className={`cus-name ${theme === "dark" ? "text-gray-100" : "text-gray-800"} text-sm font-bold`}
                        >
                            {cusname}
                        </div>
                    ) : (
                        status === "error" && <FaildToFetchData size={"xs"} />
                    )}
                    <div className="closebtn-backbtn flex items-center gap-3">
                        <button
                            onClick={closeTicketHandler}
                            disabled={disabled}
                            className={`close-btn ${disabled ? "opacity-45 cursor-no-drop" : "opacity-100 cursor-pointer"} bg-green-500 text-white rounded-lg py-1 px-2 text-xs flex items-center gap-1`}
                        >
                            <FontAwesomeIcon icon={faTicket} /> بستن تیکت
                        </button>
                        <button
                            onClick={() => router.push("/dashboard/chats")}
                            className={`back-btn ${theme == "dark" ? "text-gray-100" : "text-gray-700"} cursor-pointer text-2xl flex justify-center items-center`}
                        >
                            <FontAwesomeIcon icon={faCircleLeft} />
                        </button>
                    </div>
                </div>
                <div className="stickers mt-2 flex items-center gap-2">
                    <div
                        className={`title ${theme === "dark" ? "text-gray-300" : "text-gray-500"} text-xs`}
                    >
                        برچسب :
                    </div>
                    <ProblemLabel
                        title={problemLabel}
                        theme={theme}
                        status={status}
                    />
                </div>
            </div>
        </>
    );
}
