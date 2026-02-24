import { faComments } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function ChatWidget({ openChatWidget, chatWidgetState }) {
    return (
        <>
            <div
                onClick={openChatWidget}
                className={`chat-widget-container transition-all duration-600 ease-[cubic-bezier(.62,-0.31,.26,1.37)] ${chatWidgetState ? 'translate-y-40' :'translate-y-0'} cursor-pointer fixed z-10 bottom-5 right-5 flex justify-center items-center bg-white size-16 rounded-full border-3 border-blue-500`}
            >
                <div className="notfication">
                    <div className="size-3.5 absolute top-0 left-0 bg-blue-500 rounded-full animate-ping"></div>
                    <div className="size-3.5 absolute top-0 left-0 bg-white rounded-full border-2 border-blue-500"></div>
                </div>
                <div className="chat-widget bg-blue-500 text-white rounded-full size-14 flex justify-center items-center text-2xl">
                    <FontAwesomeIcon icon={faComments} />
                </div>
            </div>
        </>
    );
}
