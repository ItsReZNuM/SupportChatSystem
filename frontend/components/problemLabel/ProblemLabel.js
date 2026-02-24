import FaildToFetchData from "../faildToFetchData/FaildToFetchData";

export default function ProblemLabel({ title, theme, status }) {
    return status === "pending" ? (
        <div
            className={`h-6 w-20 rounded-md animate-pulse ${
                theme === "dark" ? "bg-gray-600" : "bg-gray-200"
            }`}
        />
    ) : status === "success" ? (
        <div
            className={`problem-label text-xs py-1 px-2 flex items-center justify-center rounded-md ${theme === "dark" ? "bg-gray-600 text-gray-100" : "bg-gray-200 text-gray-800"}`}
        >
            {title}
        </div>
    ) : (
        status === "error" && <FaildToFetchData size={"xs"} />
    );
}
