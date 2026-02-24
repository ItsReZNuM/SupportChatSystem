export default function EmojiTab({emojiTabStatus , textareaHeight , theme, setMessage}) {

        const Emojis = [
        {
            id: 1,
            emoji: "😀",
        },
        {
            id: 2,
            emoji: "😁",
        },
        {
            id: 3,
            emoji: "😂",
        },
        {
            id: 4,
            emoji: "🤣",
        },
        {
            id: 5,
            emoji: "😊",
        },
        {
            id: 6,
            emoji: "😍",
        },
        {
            id: 7,
            emoji: "😘",
        },
        {
            id: 8,
            emoji: "😎",
        },
        {
            id: 9,
            emoji: "🤔",
        },
        {
            id: 10,
            emoji: "😢",
        },
        {
            id: 11,
            emoji: "😭",
        },
        {
            id: 12,
            emoji: "😡",
        },
        {
            id: 13,
            emoji: "👍",
        },
        {
            id: 14,
            emoji: "👎",
        },
        {
            id: 15,
            emoji: "🙏",
        },

        {
            id: 16,
            emoji: "👏",
        },
        {
            id: 17,
            emoji: "❤️",
        },
        {
            id: 18,
            emoji: "🔥",
        },
    ];


    return (
        <div
            className={`emoji-tab transition-all duration-300 ${emojiTabStatus ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"} absolute w-full left-0 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} h-20 flex flex-wrap p-3`}
            style={{
                bottom: emojiTabStatus ? textareaHeight + "px" : 0,
            }}
        >
            {Emojis.map((elem) => {
                return (
                    <span
                        onClick={() => setMessage((prev) => prev + elem.emoji)}
                        className="text-2xl w-1/12 col-1 cursor-pointer select-none"
                        key={elem.id}
                    >
                        <b>{elem.emoji}</b>
                    </span>
                );
            })}
        </div>
    );
}
