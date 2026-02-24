"use client";

import { toTime } from "@/utils/date";
import { faCaretUp, faL, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";

export default function MessageBox({
    sender_id,
    me_id,
    messageBody,
    messageTime,
    fileURL,
}) {
    const [showFullSize, setShowFullSize] = useState(false);
    return (
        <>
            <div
                className={`message-box my-3 text-xs rounded-lg p-3 flex flex-col gap-2 max-w-[40%] wrap-break-word whitespace-pre-wrap leading-6 ${sender_id === me_id ? "bg-blue-500 ml-auto text-white" : "bg-white mr-auto text-gray-800"} relative`}
            >
                <div
                    className={`img-full-size fixed top-0 right-0 w-full h-full transition-all duration-300 ${showFullSize ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"} bg-gray-950/70 z-10 flex justify-center items-center`}
                >
                    <div className="img-container w-100 flex flex-col items-end">
                        <button
                            onClick={() => setShowFullSize(false)}
                            className="close-btn cursor-pointer text-gray-500 text-2xl"
                        >
                            <FontAwesomeIcon icon={faXmark} />
                        </button>
                        <img
                            src={`http://localhost:8000${fileURL}`}
                            alt="fullview"
                            className="w-full h-auto object-cover rounded-md"
                        />
                    </div>
                </div>
                {fileURL && (
                    <div
                        onClick={() => setShowFullSize(true)}
                        className="img-container w-full cursor-pointer"
                    >
                        <img
                            src={`http://localhost:8000${fileURL}`}
                            alt="preview"
                            className="w-full h-auto object-cover rounded-md"
                        />
                    </div>
                )}
                <p className="message-body">{messageBody}</p>
                <FontAwesomeIcon
                    className={`absolute -bottom-3.5 text-4xl ${sender_id === me_id ? "text-blue-500 -right-5" : "text-white -left-5"}`}
                    icon={faCaretUp}
                />
                <div className="time">{toTime(messageTime)}</div>
            </div>
        </>
    );
}
