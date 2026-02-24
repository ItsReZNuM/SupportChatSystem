export default function StatisticsItemLoading({ theme }) {
    return (
        <div
            className={`statistics-item w-full ${theme == "dark" ? "bg-gray-800" : "bg-white"} rounded-lg flex items-center justify-between p-5 animate-pulse`}
        >
            <div className="title-info-container flex flex-col gap-2">
                <div className="h-3 w-24 bg-gray-400 rounded-md" />
                <div className="h-4 w-12 bg-gray-400 rounded-md mt-1" />
            </div>
            <div className="h-8 w-8 bg-gray-300 rounded-md" />
        </div>
    );
}
