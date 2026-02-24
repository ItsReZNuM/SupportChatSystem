"use client";
import InputContainer from "@/components/inputContainer/InputContainer";
import { useEffect, useState } from "react";
import Copy from "@/components/copy/Copy";
import validation from "@/utils/validation";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useUIStore } from "@/store/uiStore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShieldHalved, faSpinner } from "@fortawesome/free-solid-svg-icons";
import ThemeBtn from "@/components/themeBtn/ThemeBtn";
import RateLimit from "../rateLimit/RateLimit";

export default function LoginPageContent() {
    useEffect(() => {
        const saved = localStorage.getItem("login_rate_limit");
        if (!saved) return;

        const { expiresAt } = JSON.parse(saved);
        const secondsLeft = Math.floor((expiresAt - Date.now()) / 1000);

        if (secondsLeft > 0) {
            setRetryAfter(secondsLeft);
        } else {
            localStorage.removeItem("login_rate_limit");
        }
    }, []);

    const [retryAfter, setRetryAfter] = useState(null);
    // state of loading
    const [loading, setLoading] = useState(false);
    // state of loading
    // state for error
    const [errors, setErrors] = useState({
        email: "",
        password: "",
    });
    const [serverError, setServerError] = useState("");
    // state for error

    // state for recive data
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    // state for recive data

    const router = useRouter();

    // zustand state for ui
    const theme = useUIStore((s) => s.theme);
    // zustand state for ui

    // login handler function
    const loginHandler = async () => {
        setLoading(true);
        // check empty
        const emptyErrors = { email: "", password: "" };
        if (formData.email.trim() === "")
            emptyErrors.email = "این فیلد نمی‌تواند خالی باشد.";
        if (formData.password.trim() === "")
            emptyErrors.password = "این فیلد نمی‌تواند خالی باشد.";
        const hasEmptyError = Object.values(emptyErrors).some(Boolean);
        if (hasEmptyError) {
            setErrors(emptyErrors);
            setLoading(false);
            return;
        }
        // check empty

        //check validation
        const v = validation(formData);
        if (Object.keys(v).length > 0) {
            setErrors({
                email: v.email || "",
                password: v.password || "",
            });
            setLoading(false);
            return;
        }
        //check validation

        try {
            const res = await axios.post(
                "http://localhost:8000/auth/login",
                formData,
            );

            if (res.status === 200) {
                document.cookie = `tfa_token=${res.data.otp_session_id};max-age=2*60;path=/`;
                router.push("/login/tfa");
                setLoading(false);
                return;
            }
        } catch (err) {
            if (err.status === 403) {
                if (
                    err.response.data.detail ===
                    "You don\'t have the right to login"
                ) {
                    setServerError("دسترسی غیر مجاز.");
                } else if (err.response.data.seconds) {
                    const seconds = Number(err.response.data.seconds);
                    const expiresAt = Date.now() + seconds * 1000;
                    localStorage.setItem(
                        "login_rate_limit",
                        JSON.stringify({ expiresAt }),
                    );
                    setRetryAfter(seconds);
                    setServerError("");
                }
            }
            if (err.status === 401) {
                setServerError("ایمیل یا رمز عبور نادرست می باشد.");
                setRetryAfter(null);
            }
            setLoading(false);
        }
    };
    // login handler function

    return (
        <>
            <div
                className={`login-page h-svh flex justify-center items-center relative ${
                    theme === "dark" ? "bg-gray-900" : "bg-gray-100"
                }`}
            >
                {/* btn for theme mode  */}
                <ThemeBtn />
                {/* btn for theme mode  */}
                <div
                    className={`login-form-container sm:rounded-xl sm:shadow-md w-full h-full sm:w-100 p-5 flex flex-col justify-center transition-all duration-300 sm:h-105 ${
                        (errors.email != "" || errors.password != "") &&
                        "sm:h-115"
                    } ${(serverError.length || retryAfter) && "sm:h-115"} ${theme === "dark" ? "bg-gray-800" : "bg-white"}
          `}
                >
                    <div className="login-form flex flex-col items-center">
                        <div className="icon-container pb-3">
                            <FontAwesomeIcon
                                className="text-blue-600 text-6xl"
                                icon={faShieldHalved}
                            />
                        </div>
                        <div className="title-and-desc text-center">
                            <h1
                                className={`text-[22px] font-bold ${
                                    theme === "dark"
                                        ? "text-gray-50"
                                        : "text-gray-800"
                                }`}
                            >
                                ورود به پنل ادمین
                            </h1>
                            <p
                                className={`text-sm mt-2 ${
                                    theme === "dark"
                                        ? "text-gray-400"
                                        : "text-gray-500"
                                }`}
                            >
                                برای دسترسی به داشبورد، لطفا وارد شوید.
                            </p>
                        </div>
                        <div className="inputs-and-btn w-full flex flex-col items-center mt-5 gap-4">
                            <InputContainer
                                title={"ایمیل*"}
                                type={"text"}
                                theme={theme}
                                error={errors.email}
                                onChange={(v) => {
                                    setFormData((p) => ({ ...p, email: v }));
                                    if (errors.email)
                                        setErrors((e) => ({ ...e, email: "" }));
                                    if (serverError.length) setServerError("");
                                }}
                            />
                            <InputContainer
                                title={"رمز عبور*"}
                                type={"password"}
                                theme={theme}
                                error={errors.password}
                                onChange={(v) => {
                                    setFormData((p) => ({ ...p, password: v }));
                                    if (errors.password)
                                        setErrors((e) => ({
                                            ...e,
                                            password: "",
                                        }));
                                    if (serverError.length) setServerError("");
                                }}
                            />
                            <button
                                onClick={loginHandler}
                                disabled={loading || retryAfter}
                                className={`text-white w-[95%] ${loading || retryAfter ? "cursor-no-drop" : "cursor-pointer"} bg-blue-600 rounded-lg py-2 my-2 text-sm flex items-center gap-1 justify-center`}
                            >
                                ورود
                                {loading && (
                                    <FontAwesomeIcon
                                        icon={faSpinner}
                                        className="animate-spin"
                                    />
                                )}
                            </button>

                            {serverError.length ? (
                                <div className="server-error text-xs text-red-500">
                                    {serverError}
                                </div>
                            ) : (
                                ""
                            )}
                            {retryAfter && (
                                <div className="limit text-xs text-red-500">
                                    تعداد درخواست زیاد. لطفا{" "}
                                    <RateLimit
                                        retryAfter={retryAfter}
                                        onFinish={() => {
                                            setRetryAfter(null);
                                            setServerError("");
                                        }}
                                    />{" "}
                                    دیگر مجددا تلاش کنید...
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <Copy theme={theme} />
        </>
    );
}
