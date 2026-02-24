import { faPaperclip } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useRef, useState } from "react";
import { useUIStore } from "@/store/uiStore";
import { getSocket } from "@/utils/socket";
import api from "@/utils/api";
import { getCookie } from "@/utils/getCookie";
export default function AttachFile({ param }) {
    const [previewUrl, setPreviewUrl] = useState(null);
    const fileInputRef = useRef(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const theme = useUIStore((state) => state.theme);
    const [message, setMessage] = useState("");
    const textareaRef = useRef(null);
    const [error, setError] = useState("");

    const handleInput = (e) => {
        setMessage(e.target.value);
    };
    const resizeTextarea = () => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        textarea.style.height = "auto";
        textarea.style.height = textarea.scrollHeight + "px";

        const maxHeight = 100;
        if (textarea.scrollHeight > maxHeight) {
            textarea.style.height = maxHeight + "px";
            textarea.style.overflowY = "auto";
        } else {
            textarea.style.overflowY = "hidden";
        }
    };

    const sendFileHandler = async () => {
        try {
            const formData = new FormData();
            formData.append("file", selectedFile);

            const socket = getSocket({ token: getCookie("access_token") });
            const res = await api.post(
                `/chat/conversations/upload/${param}`,
                formData,
            );

            socket.emit("admin_send_message", {
                conversation_id: param,
                body: message.trim(),
                file_url: res.data.file_url,
            });
            clearFile();
            setMessage("");
        } catch (err) {
            if (err.response?.status === 422) {
                setError(
                    "فقط تصاویر با پسوندهای webp، png، jpeg، jpg، heic، heif مجاز هستند.",
                );
            }
        }
    };

    useEffect(() => {
        resizeTextarea();
    }, [message]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setSelectedFile(file);
        if (file.type.startsWith("image/")) {
            setPreviewUrl(URL.createObjectURL(file));
        } else {
            setPreviewUrl(null);
        }
    };

    const clearFile = () => {
        error && setError("");
        setSelectedFile(null);
        setPreviewUrl(null);
        fileInputRef.current.value = "";
    };
    return (
        <div className="attach-file">
            <div
                className={`show-attached-file-and-desc flex justify-center items-center fixed z-10 top-0 right-0 h-full w-full bg-gray-950/70 transition-all duration-300 ${selectedFile ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
            >
                <div
                    className={`main ${theme === "dark" ? "bg-gray-800" : "bg-white"}  w-100 h-auto rounded-lg p-3 flex flex-col items-center gap-5`}
                >
                    <div className="img-container w-full">
                        <img
                            src={previewUrl}
                            alt="preview"
                            className="w-full h-auto object-cover rounded-md"
                        />
                    </div>
                    {error.length > 0 && (
                        <p className="error text-sm text-red-500">{error}</p>
                    )}
                    <div className="input-btn-container w-full">
                        <div className="input-container">
                            <textarea
                                ref={textareaRef}
                                value={message}
                                onChange={handleInput}
                                placeholder="برای پاسخ تایپ کنید..."
                                rows={1}
                                className={`w-full resize-none outline-none text-sm p-2 border rounded-lg ${theme === "dark" ? "text-gray-100 border-gray-600 dark-textarea-scroll" : "text-gray-800 textarea-scroll border-gray-200"}`}
                                style={{ maxHeight: "100px" }}
                            />
                        </div>
                        <div className="btn-container flex justify-between mt-1">
                            <button
                                onClick={sendFileHandler}
                                className="text-gray-100 bg-blue-500 py-1 px-5 rounded-lg cursor-pointer"
                            >
                                ارسال
                            </button>
                            <button
                                onClick={clearFile}
                                className="text-gray-100 bg-red-500 py-1 px-5 rounded-lg cursor-pointer"
                            >
                                لغو
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileChange}
            />
            <button
                onClick={() => fileInputRef.current.click()}
                className={`flex items-center justify-center cursor-pointer`}
            >
                <FontAwesomeIcon className="text-gray-500" icon={faPaperclip} />
            </button>
        </div>
    );
}
