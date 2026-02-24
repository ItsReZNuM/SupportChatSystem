"use client";

import { faFaceSmile, faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useRef, useState } from "react";
import EmojiTab from "../emojiTab/EmojiTab";
import AttachFile from "../attachFile/AttachFile";


export default function MessageAreaInput({
    sendMessageHandler,
    theme,
    disabled,
    param,
    message,
    setMessage
}) {
    const textareaRef = useRef(null);
    const [textareaHeight, setTextareaHeight] = useState(52);
    const [emojiTabStatus, setEmojiTabStatus] = useState(false);
    
    const handleInput = (e) => {
        setMessage(e.target.value);
    };
    const resizeTextarea = () => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        textarea.style.height = "auto";
        textarea.style.height = textarea.scrollHeight + "px";

        const maxHeight = 150;
        if (textarea.scrollHeight > maxHeight) {
            textarea.style.height = maxHeight + "px";
            textarea.style.overflowY = "auto";
        } else {
            textarea.style.overflowY = "hidden";
        }

        setTextareaHeight(textarea.offsetHeight + 16);
    };
    useEffect(() => {
        resizeTextarea();
    }, [message]);
    return (
        <>
            <div
                className={`message-area-input relative mt-auto ${theme == "dark" ? "bg-gray-800 border-gray-600" : "bg-white border-gray-200"} border-y flex items-center gap-2 p-3`}
            >
                {disabled ? (
                    <div className="input-disabled text-red-500 text-center w-full">
                        این گفتگو پایان یافته است.
                    </div>
                ) : (
                    <>
                        <AttachFile param={param} />
                        <div
                            onClick={() => setEmojiTabStatus(!emojiTabStatus)}
                            className="emoji-btn flex items-center text-xl text-gray-500 cursor-pointer"
                        >
                            <FontAwesomeIcon icon={faFaceSmile} />
                        </div>
                        <div className="input w-full flex justify-center items-center">
                            <EmojiTab
                                emojiTabStatus={emojiTabStatus}
                                textareaHeight={textareaHeight}
                                theme={theme}
                                setMessage={setMessage}
                            />
                            <textarea
                                ref={textareaRef}
                                value={message}
                                onChange={handleInput}
                                placeholder="برای پاسخ تایپ کنید..."
                                rows={1}
                                className={`w-full resize-none outline-none text-sm p-2 ${theme === "dark" ? "text-gray-100 border-gray-600 dark-textarea-scroll" : "text-gray-800 textarea-scroll border-gray-200"}`}
                                style={{ maxHeight: "150px" }}
                            />
                        </div>
                        <div className="send-message">
                            {message.length > 0 && <button
                                onClick={sendMessageHandler}
                                className="send-btn rounded-lg bg-blue-500 cursor-pointer text-white p-2 pr-1 flex justify-center items-center"
                            >
                                <FontAwesomeIcon
                                    className="-rotate-135"
                                    icon={faPaperPlane}
                                />
                            </button>}
                        </div>
                    </>
                )}
            </div>
        </>
    );
}
