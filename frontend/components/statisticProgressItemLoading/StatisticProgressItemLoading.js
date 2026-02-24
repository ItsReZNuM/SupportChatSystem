export default function StatisticProgressItemLoading({ theme }) {
    return (
        <div className="statistic-progress-item flex flex-col animate-pulse">
            <div className="title-icon-info flex justify-between items-center">
                <div className="title-icon flex items-center gap-2">
                    <div className="size-5 bg-gray-300 rounded-md" />
                    <div className="h-3 w-24 bg-gray-300 rounded-md" />
                </div>
                <div className="h-3 w-10 bg-gray-300 rounded-md" />
            </div>
            <div
                className={`progress-bar-container ${theme == "dark" ? "bg-gray-600" : "bg-gray-200"} w-full h-2 rounded-xl mt-2`}
            >
                <div className="progress-bar-thumb w-1/4 rounded-xl h-full bg-gray-300" />
            </div>
        </div>
    );
}
