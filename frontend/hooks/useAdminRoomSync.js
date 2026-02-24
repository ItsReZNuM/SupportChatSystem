// hooks/useAdminRoomsSync.js
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getSocket } from "@/utils/socket";
import { getCookie } from "@/utils/getCookie";

export function useAdminRoomsSync() {
    const queryClient = useQueryClient();

    useEffect(() => {
        const socket = getSocket({ token: getCookie("access_token") });

        const handleAdminNotify = (data) => {
            if (data.type === "new_conversation") {
                queryClient.setQueryData(["roomList"], (oldData) => {
                    if (!oldData?.pages?.length) return oldData;
                    return {
                        ...oldData,
                        pages: [
                            {
                                ...oldData.pages[0],
                                items: [
                                    data.conversation,
                                    ...oldData.pages[0].items,
                                ],
                            },
                            ...oldData.pages.slice(1),
                        ],
                    };
                });
            }

            if (data.type === "new_message") {
                queryClient.setQueryData(["roomList"], (oldData) => {
                    if (!oldData?.pages?.length) return oldData;

                    let targetRoom = null;

                    // آپدیت last_message در همه صفحات
                    const updatedPages = oldData.pages.map((page) => ({
                        ...page,
                        items: page.items
                            .map((room) => {
                                if (room.id === data.conversation_id) {
                                    targetRoom = {
                                        ...room,
                                        last_message: data.last_message,
                                    };
                                    return targetRoom;
                                }
                                return room;
                            })
                            // حذف از جای فعلی (بعداً اول اضافه میشه)
                            .filter((room) => room.id !== data.conversation_id),
                    }));

                    if (!targetRoom) return oldData;

                    // بذار اول صفحه اول
                    return {
                        ...oldData,
                        pages: [
                            {
                                ...updatedPages[0],
                                items: [targetRoom, ...updatedPages[0].items],
                            },
                            ...updatedPages.slice(1),
                        ],
                    };
                });
            }
        };

        socket.on("admin_notify", handleAdminNotify);

        return () => {
            socket.off("admin_notify", handleAdminNotify);
        };
    }, [queryClient]);
}
