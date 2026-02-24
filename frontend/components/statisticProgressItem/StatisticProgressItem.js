export default function StatisticProgressItem({
    title,
    icon,
    info,
    color,
    barColor,
    theme,
    total,
}) {
    const percent = total ? Math.min((info / total) * 100, 100) : 0;
    return (
        <>
            <div className="statistic-progress-item flex flex-col">
                <div className="title-icon-info flex justify-between items-center">
                    <div
                        className={`title-icon flex items-center gap-2 text-xl ${color}`}
                    >
                        {icon}
                        <div
                            className={`title text-xs ${theme == "dark" ? "text-gray-100" : "text-gray-700"} font-bold`}
                        >
                            {title}
                        </div>
                    </div>
                    <div
                        className={`info text-xs ${theme == "dark" ? "text-gray-100" : "text-gray-600"}`}
                    >
                        {info}
                    </div>
                </div>
                <div
                    className={`progress-bar-container ${theme == "dark" ? "bg-gray-600" : "bg-gray-200"} w-full h-2 rounded-xl mt-2`}
                >
                    <div
                        className={`progress-bar-thumb rounded-xl h-full ${barColor}`}
                        style={{ width: `${percent}%` }}
                    ></div>
                </div>
            </div>
        </>
    );
}
