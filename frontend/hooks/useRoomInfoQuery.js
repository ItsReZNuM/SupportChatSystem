import api from "@/utils/api";
import { useQuery } from "@tanstack/react-query";

const getRoomInfo = async ({queryKey}) => {
    const res = await api.get(`/chat/conversations/conversation_info/${queryKey[1]}/`);
    return res.data;
};

export default function useRoomInfoQuery(room_id) {
    return useQuery({
        queryKey: ["room_info",room_id],
        queryFn: getRoomInfo,
    });
}