import api from "@/utils/api";
import { useInfiniteQuery } from "@tanstack/react-query";

const getRoomList = async ({ pageParam = 0 }) => {
    const res = await api.get("/chat/admin/conversations", {
        params: {
            only_unassigned: false,
            limit: 10,
            offset: pageParam,
        },
    });
    return res.data;
};

export default function useRoomInfiniteQuery() {
    return useInfiniteQuery({
        queryKey: ["roomList"],
        initialPageParam: 0,
        queryFn: getRoomList,
        getNextPageParam: (lastPage, allPages) => {
            const loadedCount = allPages.reduce(
                (sum, page) => sum + page.items.length,
                0
            );

            if (loadedCount >= lastPage.total) return undefined;

            return loadedCount;
        },
    });
}
