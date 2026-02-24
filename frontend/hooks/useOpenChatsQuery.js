import api from "@/utils/api";
import { useQuery } from "@tanstack/react-query";

const getOpenChatsDash = async () => {
    const res = await api.get("/chat/dashboard/tickets");
    return res.data;
};

export default function useOpenChatsQuery() {
    return useQuery({
        queryKey: ["open_chats"],
        queryFn: () => getOpenChatsDash(),
    });
}