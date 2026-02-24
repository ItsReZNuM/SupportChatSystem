"use client";

import {
    faFaceSmile,
    faPaperclip,
    faPaperPlane,
    faSpinner,
    faUser,
    faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useRef, useState } from "react";
import EmojiTab from "../emojiTab/EmojiTab";
import MessageBox from "../messageBox/MessageBox";
import AuthClientFormChat from "../authClientFormChat/AuthClientFormChat";
import { useUIStore } from "@/store/uiStore";
import axios from "axios";
import { getSocket } from "@/utils/socket";
import useMessageInfiniteQuery from "@/hooks/useMessageInfiniteQuery";
import RateToSupport from "../rateToSupport/RateToSupport";
import GuestAttachFile from "../gusetAttachFile/GuestAttachFile";

export default function ClientChatScreen({ closeChatWidget, chatWidgetState }) {
    // show auth form
    const [showForm, setShowForm] = useState(true);
    // ui status
    const theme = useUIStore((state) => state.theme);
    // state for type message
    const [message, setMessage] = useState("");
    // state for recive messages
    const [messages, setMessages] = useState([]);
    // state for guest id
    const [guestId, setGuestId] = useState(() => {
        if (typeof window === "undefined") return null;
        const raw = localStorage.getItem("chat_session_key");
        return raw ? JSON.parse(raw).guest_id : null;
    });
    // state for conversation id
    const [conversationId, setConversationId] = useState(() => {
        if (typeof window === "undefined") return null;
        const raw = localStorage.getItem("chat_session_key");
        return raw ? JSON.parse(raw).conversation_id : null;
    });
    // state for can send or not
    const [sendStatus, setSendStatus] = useState(false);
    // state for handeling size of textarea
    const textareaRef = useRef(null);
    // state for emoji tab status
    const [emojiTabStatus, setEmojiTabStatus] = useState(false);
    // state for textarea height
    const [textareaHeight, setTextareaHeight] = useState(52);

    const [showRating, setShowRating] = useState(false);

    const { data, isFetchingNextPage, hasNextPage, fetchNextPage, status } =
        useMessageInfiniteQuery(conversationId);
    const flatMessageIds = new Set(
        data?.pages?.flatMap((p) => p.items.map((m) => m.id)) ?? [],
    );

    const uniqueNewMessages = messages.filter(
        (msg) => !flatMessageIds.has(msg.id),
    );
    const flatMessages =
        data?.pages?.flatMap((p) => p.items ?? p.messages ?? []) ?? [];
    const handleInput = (e) => {
        setMessage(e.target.value);
    };
    const sendMessageHandler = async () => {
        if (!message.trim().length) return;
        const { username, email, problem } = JSON.parse(
            localStorage.getItem("formData"),
        );
        let sessionRaw = localStorage.getItem("chat_session_key");
        if (!sessionRaw) {
            const res = await axios.post(
                "http://localhost:8000/chat/conversations",
                {
                    contact_email: email,
                    label: problem,
                    display_name: username,
                },
            );
            const { guest_id, id } = res.data;
            localStorage.setItem(
                "chat_session_key",
                JSON.stringify({
                    guest_id: guest_id,
                    conversation_id: id,
                }),
            );
            setGuestId(guest_id);
            setConversationId(id);
            sessionRaw = localStorage.getItem("chat_session_key");
        }
        const guest_id = JSON.parse(sessionRaw).guest_id;
        const conversation_id = JSON.parse(sessionRaw).conversation_id;
        const socket = getSocket({ guest_id });

        if (!socket.connected) {
            socket.once("connect", () => {
                console.log("*connected*");
                socket.emit("join_conversation", { conversation_id });
                socket.emit("send_message", { conversation_id, body: message });
            });
        } else {
            socket.emit("send_message", { conversation_id, body: message });
        }

        setMessage("");
    };
    const loadMore = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (
                    entries[0].isIntersecting &&
                    hasNextPage &&
                    !isFetchingNextPage
                ) {
                    fetchNextPage();
                }
            },
            { threshold: 1 },
        );
        if (loadMore.current) observer.observe(loadMore.current);
        return () => {
            if (loadMore.current) observer.unobserve(loadMore.current);
        };
    }, [loadMore, hasNextPage, fetchNextPage, isFetchingNextPage]);
    useEffect(() => {
        const sessionRaw = localStorage.getItem("chat_session_key");
        if (!sessionRaw) return;
        const sessionData = JSON.parse(sessionRaw);
        const guest_id = sessionData.guest_id;
        const conversation_id = sessionData.conversation_id;
        setGuestId(guest_id);
        const socket = getSocket({ guest_id });

        const onConnect = () => {
            socket.emit("join_conversation", { conversation_id });
        };
        if (socket.connected) onConnect();
        socket.on("connect", onConnect);

        const onNewMessage = (msg) => {
            setMessages((prev) => [...prev, msg]);
        };
        socket.on("closed", () => {
            setShowRating(true);
        });
        socket.on("new_message", onNewMessage);
        socket.on("error", (msg) => {
            console.log("socket get error: ", msg);
        });
        return () => {
            socket.off("connect", onConnect);
            socket.off("new_message", onNewMessage);
        };
    }, [conversationId]);
    const bottomRef = useRef(null);

    useEffect(() => {
        resizeTextarea();
        if (message.length > 0) {
            setSendStatus(true);
        } else if (message.length === 0) {
            setSendStatus(false);
        }
    }, [message]);
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);
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
    return (
        <>
            <div
                className={`client-chat-screen-container flex flex-col fixed justify-between overflow-hidden bottom-5 right-5 transition-all duration-400 ease-in-out bg-white w-100 h-160 rounded-lg ${theme === "dark" ? "bg-[url('/images/darktelback.jpg')]" : "bg-[url('/images/telback.jpg')]"} bg-center bg-no-repeat bg-cover ${chatWidgetState ? "translate-x-0" : "translate-x-120"}`}
            >
                {showRating && <RateToSupport setShowRating={setShowRating} />}
                <div className="client-chat-screen-header bg-blue-500 p-4 flex justify-between shadow-xl">
                    <div className="support-profile-title flex items-center gap-5">
                        <div className="support-profile size-10 rounded-full text-xl text-white flex justify-center items-center border-2 border-white">
                            <FontAwesomeIcon icon={faUser} />
                        </div>
                        <div className="support-title whitespace-nowrap">
                            <p className="text-sm text-gray-900">
                                پشتیبانی سایت
                            </p>
                            <p className="text-xs text-gray-700">
                                پاسخگوی سوالات شما هستیم.
                            </p>
                        </div>
                    </div>
                    <div
                        onClick={closeChatWidget}
                        className="close-btn text-white bg-gray-800/50 size-7 flex justify-center items-center rounded-full cursor-pointer"
                    >
                        <FontAwesomeIcon icon={faXmark} />
                    </div>
                </div>
                <div className="client-chat-messages overflow-y-auto overflow-x-hidden h-full p-5 relative">
                    <AuthClientFormChat
                        showForm={showForm}
                        setShowForm={setShowForm}
                    />
                    <div
                        ref={loadMore}
                        className="flex justify-center items-center text-xs text-gray-400 gap-2 mb-2"
                    >
                        {isFetchingNextPage && (
                            <>
                                <FontAwesomeIcon
                                    icon={faSpinner}
                                    className="animate-spin"
                                />
                                در حال بارگیری
                            </>
                        )}
                    </div>
                    <div className="messages">
                        {flatMessages.map((msg) => {
                            return (
                                <MessageBox
                                    key={msg.id}
                                    sender_id={msg.sender_id}
                                    me_id={guestId}
                                    messageBody={msg.body}
                                    messageTime={msg.created_at}
                                    fileURL={msg.file_url}
                                />
                            );
                        })}
                        {uniqueNewMessages.map((msg) => {
                            return (
                                <MessageBox
                                    key={msg.id}
                                    sender_id={msg.sender_id}
                                    me_id={guestId}
                                    messageBody={msg.body}
                                    messageTime={msg.created_at}
                                    fileURL={msg.file_url}
                                />
                            );
                        })}
                        <div ref={bottomRef}></div>
                    </div>
                </div>
                <div
                    className={`input-container ${showForm ? "pointer-events-none" : "pointer-events-auto"} ${theme === "dark" ? "bg-gray-800" : "bg-white"}  flex items-center justify-between py-2 px-1 shadow-2xl`}
                >
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
                        placeholder="پیام خود را بنویسید..."
                        rows={1}
                        className={`w-[80%] resize-none outline-none text-sm p-2 ${theme === "dark" ? "text-gray-200" : "text-gray-800"}`}
                        style={{ maxHeight: "150px" }}
                    />
                    <div className="btn-container flex p-2 gap-1">
                        <div
                            onClick={() => setEmojiTabStatus(!emojiTabStatus)}
                            className="emoji-btn flex items-center text-xl text-gray-500 cursor-pointer"
                        >
                            <FontAwesomeIcon icon={faFaceSmile} />
                        </div>
                        {sendStatus ? (
                            <div
                                onClick={sendMessageHandler}
                                className="send-btn flex items-center text-xl text-blue-500 cursor-pointer -rotate-135"
                            >
                                <FontAwesomeIcon icon={faPaperPlane} />
                            </div>
                        ) : (
                            <GuestAttachFile
                                conversationId={conversationId}
                                setConversationId={setConversationId}
                                guestId={guestId}
                                setGuestId={setGuestId}
                            />
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
