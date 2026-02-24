export default function OpenChatsItemLoading({ theme }) {
    return (
        <div
            className={`open-chats-item p-3 ${theme == "dark" ? "bg-gray-600" : "bg-gray-100"} rounded-lg flex items-center animate-pulse`}
        >
            <div className="dot size-3 bg-gray-300 rounded-full" />
            <div className="title-user mr-4 flex flex-col gap-2">
                <div className="h-3 w-36 bg-gray-300 rounded-md" />
                <div className="h-2 w-20 bg-gray-300 rounded-md" />
            </div>
            <div className="mr-auto h-2 w-8 bg-gray-300 rounded-md self-end" />
        </div>
    );
}
