import { getSocket } from "@/utils/socket";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { useRouter } from "next/navigation";
export default function RateToSupport({ setShowRating }) {
    // state for rating
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const router = useRouter();

    const submitRating = () => {
        console.log(router);
        const { conversation_id, guest_id } = JSON.parse(
            localStorage.getItem("chat_session_key"),
        );
        console.log(conversation_id, guest_id);
        const socket = getSocket({ guest_id });
        socket.emit("rate_conversation", {
            conversation_id,
            rating,
        });
        localStorage.removeItem("chat_session_key");
        localStorage.removeItem("formData");
        setShowRating(false);
        window.location.reload();
    };
    return (
        <div className="rate-to-support absolute z-10 w-full h-full bg-gray-500/50 backdrop-blur-sm flex flex-col justify-center items-center gap-9">
            <p className="title font-bold text-gray-800 drop-shadow-[0_0_12px_rgba(255,255,255,0.8)]">
                میزان رضایت از پشتیبانی:
            </p>
            <div className="rate-btns flex flex-col justify-center gap-3">
                <div className="stars flex gap-1 [direction:ltr]">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHover(star)}
                            onMouseLeave={() => setHover(0)}
                            className="text-3xl cursor-pointer"
                        >
                            <FontAwesomeIcon
                                icon={faStar}
                                className={`transition-all duration-300 ${
                                    (hover || rating) >= star
                                        ? "text-yellow-400"
                                        : "text-gray-300"
                                }`}
                            />
                        </button>
                    ))}
                </div>
                <button
                    onClick={() => submitRating()}
                    className={`py-1 px-2 border border-white transition-all duration-300 ${rating ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"} rounded-md bg-blue-500 text-white cursor-pointer`}
                >
                    ثبت
                </button>
            </div>
        </div>
    );
}
