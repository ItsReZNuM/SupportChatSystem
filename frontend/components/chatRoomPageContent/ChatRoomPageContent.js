"use client";

import ChatRoomHeader from "@/components/chatRoomHeader/ChatRoomHeader";
import CustomerInfoSideBar from "@/components/customerInfoSideBar/CustomerInfoSideBar";
import MessageAreaInput from "@/components/messageAreaInput/MessageAreaInput";
import MessageBox from "@/components/messageBox/MessageBox";
import useRoomInfoQuery from "@/hooks/useRoomInfoQuery";
import { useUIStore } from "@/store/uiStore";
import { useEffect, useRef, useState } from "react";
import FaildToFetchData from "../faildToFetchData/FaildToFetchData";
import useIdQuery from "@/hooks/useIdQuery";
import useMessageInfiniteQuery from "@/hooks/useMessageInfiniteQuery";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getSocket } from "@/utils/socket";
import { getCookie } from "@/utils/getCookie";

export default function ChatRoomPageContent({ param }) {
    const loadMore = useRef(null);
    const theme = useUIStore((state) => state.theme);
    const [sideBarStatus, setSideBarStatus] = useState(false);
    const { data, status } = useRoomInfoQuery(param);
    const [closedBySocket, setClosedBySocket] = useState(false);
    const isClosed = closedBySocket || data?.conversation?.status === "closed";
    const {
        data: messages,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
        status: messagesStatus,
    } = useMessageInfiniteQuery(param);
    const { data: info } = useIdQuery();
    const [message, setMessage] = useState("");
    const [newMessages, setNewMessages] = useState([]);
    const bottomRef = useRef(null);
    const closeTicketHandler = () => {
        const socket = getSocket({ authID: info?.id });
        socket.emit("admin_close", { conversation_id: param });
    };
    const flatMessageIds = new Set(
        messages?.pages?.flatMap((p) => p.items.map((m) => m.id)) ?? [],
    );

    const uniqueNewMessages = newMessages.filter(
        (msg) => !flatMessageIds.has(msg.id),
    );
    const sendMessageHandler = async () => {
        if (!message.trim().length) return;
        const socket = getSocket({ authID: info?.id });
        socket.emit("admin_send_message", {
            conversation_id: param,
            body: message,
        });

        setMessage("");
    };

    console.log(messages);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (
                    entries[0].isIntersecting &&
                    hasNextPage &&
                    !isFetchingNextPage
                ) {
                    console.log("hellop");
                    fetchNextPage();
                }
            },
            {
                threshold: 1,
            },
        );
        if (loadMore.current) {
            observer.observe(loadMore.current);
        }
        return () => {
            if (loadMore.current) {
                observer.unobserve(loadMore.current);
            }
        };
    }, [loadMore, hasNextPage, fetchNextPage, isFetchingNextPage]);
    useEffect(() => {
        const socket = getSocket({ token: getCookie("access_token") });
        const onConnect = () => {
            socket.emit("admin_accept", { conversation_id: param });
            socket.emit("join_conversation", { conversation_id: param });
        };
        if (socket.connected) onConnect();
        socket.on("connect", onConnect);

        const onNewMessage = (msg) => {
            console.log(msg);
            setNewMessages((prev) => [...prev, msg]);
        };
        socket.on("closed", () => {
            setClosedBySocket(true);
        });
        socket.on("new_message", onNewMessage);
        socket.on("error", (msg) => {
            console.log("socket get error: ", msg);
        });
        return () => {
            socket.off("connect", onConnect);
            socket.off("new_message", onNewMessage);
            socket.off("closed");
        };
    }, []);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [newMessages]);

    return (
        <>
            <div
                className={`col w-full sm:w-9/12 h-full ${theme == "dark" ? "bg-gray-900" : "bg-gray-200"}`}
            >
                <div className="chat-room h-full flex flex-col">
                    <ChatRoomHeader
                        cusname={data?.conversation.guest_display_name}
                        theme={theme}
                        problemLabel={data?.conversation.label}
                        status={status}
                        closeTicketHandler={closeTicketHandler}
                        disabled={isClosed}
                    />
                    <div
                        className={`chat-area w-full h-full p-5 flex flex-col overflow-y-scroll ${theme == "dark" ? "dark-gray-scroll" : "gray-scroll"} `}
                    >
                        {messagesStatus === "success"
                            ? messages?.pages[0].items.map((message) => (
                                  <MessageBox
                                      key={message.id}
                                      sender_id={message.sender_id}
                                      me_id={info?.id}
                                      messageBody={message.body}
                                      messageTime={message.created_at}
                                      fileURL={message.file_url}
                                  />
                              ))
                            : messagesStatus === "error" && (
                                  <FaildToFetchData
                                      size={"lg"}
                                      align={"center"}
                                  />
                              )}
                        {uniqueNewMessages.map((msg) => (
                            <MessageBox
                                key={msg.id}
                                sender_id={msg.sender_id}
                                me_id={info?.id}
                                messageBody={msg.body}
                                messageTime={msg.created_at}
                                fileURL={msg.file_url}
                            />
                        ))}
                        <div ref={bottomRef}></div>
                        <div
                            ref={loadMore}
                            className="load-more mt-auto flex justify-center items-center text-xs text-gray-200 gap-2"
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
                    </div>
                    <MessageAreaInput
                        sendMessageHandler={sendMessageHandler}
                        theme={theme}
                        disabled={isClosed}
                        param={param}
                        message={message}
                        setMessage={setMessage}
                    />
                </div>
            </div>
            <CustomerInfoSideBar
                sideBarStatus={sideBarStatus}
                setSideBarStatus={setSideBarStatus}
                theme={theme}
                cusname={data?.conversation.guest_display_name}
                cusemail={data?.conversation.guest_email}
                status={status}
            />
        </>
    );
}
