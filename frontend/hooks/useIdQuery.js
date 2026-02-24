import api from "@/utils/api";
import { useQuery } from "@tanstack/react-query";

const getAdminInfo = async () => {
    const res = await api.get("/me");
    return res.data;
};

export default function useIdQuery() {
    return useQuery({
        queryKey: ["admin_id"],
        queryFn: () => getAdminInfo(),
    });
}