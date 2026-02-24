import api from "@/utils/api";
import { useInfiniteQuery } from "@tanstack/react-query";

const getMessages = async ({ queryKey, pageParam = 0 }) => {
    const res = await api.get(`/chat/conversations/messages/${queryKey[1]}`, {
        params: {
            only_unassigned: false,
            limit: 50,
            offset: pageParam,
        },
    });
    return res.data;
};

export default function useMessageInfiniteQuery(conversation_id) {
    return useInfiniteQuery({
        queryKey: ["messages", conversation_id],
        initialPageParam: 0,
        queryFn: getMessages,
        enabled: !!conversation_id,
        getNextPageParam: (lastPage, allPages) => {
            const loaded = allPages.reduce(
                (sum, p) => sum + (p.items?.length || 0),
                0,
            );
            if (loaded >= (lastPage.total || 0)) return undefined;
            return loaded;
        },
    });
}
