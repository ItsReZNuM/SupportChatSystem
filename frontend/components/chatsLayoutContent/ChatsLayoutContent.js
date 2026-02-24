"use client";
import { useUIStore } from "@/store/uiStore";
import ChatListItem from "../chatListItem/ChatListItem";
import { useSelectedLayoutSegment } from "next/navigation";
import useRoomInfiniteQuery from "@/hooks/useRoomInfiniteQuery";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useRef } from "react";
import ChatListItemLoading from "../chatListItemLoading/ChatListItemLoading";
import FaildToFetchRoom from "../faildToFetchRoom/FaildToFetchRoom";
import { useAdminRoomsSync } from "@/hooks/useAdminRoomSync";
import NoMoreOpenChat from "../noMoreOpenChat/NoMoreOpenChat";

export default function ChatsLayoutContent({ children }) {
    const theme = useUIStore((s) => s.theme);
    const loadMore = useRef(null);
    const roomId = useSelectedLayoutSegment();
    useAdminRoomsSync();
    const { data, hasNextPage, fetchNextPage, isFetchingNextPage, status } =
        useRoomInfiniteQuery();
    const rooms = data?.pages?.flatMap((p) => p.items) ?? [];
    const showListOnMobile = roomId == null;
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
    return (
        <>
            <div
                className={`chats-layout h-[calc(100%-65px)] md:h-[calc(100%-77px)] md:pr-18 ${theme === "dark" ? "bg-gray-900" : "bg-gray-100"} overflow-hidden`}
            >
                <div className="row h-full flex relative">
                    <div
                        className={`col w-full ${showListOnMobile ? "w-full" : "hidden"} sm:block sm:w-3/12 h-full`}
                    >
                        <div
                            className={`active-chats-section flex flex-col overflow-y-scroll no-scrollbar ${theme == "dark" ? "bg-gray-800 border-gray-600" : "bg-white border-gray-200"} w-full h-full border border-y-0 border-r-0`}
                        >
                            <div
                                className={`title p-3 border-b ${theme === "dark" ? "border-gray-600" : "border-gray-200"}`}
                            >
                                <h5
                                    className={`${theme == "dark" ? "text-gray-100" : "text-gray-800"} text-sm font-bold`}
                                >
                                    چت های فعال
                                </h5>
                            </div>
                            <div className="chats-list">
                                {status === "pending" ? (
                                    <ChatListItemLoading theme={theme} />
                                ) : status === "success" ? (
                                    rooms ? (
                                        rooms?.map((roomItem) => {
                                            return (
                                                <ChatListItem
                                                    key={roomItem.id}
                                                    cusName={`${roomItem?.customer_display_name} -- ${roomItem?.customer_id?.slice(-5)}`}
                                                    sumMessage={
                                                        roomItem.last_message
                                                            ?.body
                                                    }
                                                    roomURL={roomItem.id}
                                                    lastMessageTime={
                                                        roomItem.last_message
                                                            ?.created_at
                                                    }
                                                />
                                            );
                                        })
                                    ) : (
                                        <div className="no-more-container p-2">
                                            <NoMoreOpenChat />
                                        </div>
                                    )
                                ) : (
                                    status === "error" && <FaildToFetchRoom />
                                )}
                            </div>
                            <div
                                ref={loadMore}
                                className="load-more mb-10 flex justify-center items-center text-xs text-gray-200 gap-2"
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
                    </div>
                    {children}
                </div>
            </div>
        </>
    );
}
