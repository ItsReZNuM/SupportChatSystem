import api from "@/utils/api";
import { useQuery } from "@tanstack/react-query";

const getStatistics = async ({admin_id}) => {
    console.log("calling stats with:", admin_id);
    const res = await api.get(`/chat/admin/stats/${admin_id}`);
    return res.data;
};

export default function useStatisticsQuery(admin_id) {
    return useQuery({
        queryKey: ["admin_statistics" , admin_id],
        queryFn: () => getStatistics({admin_id}),
        enabled: !!admin_id
    });
}