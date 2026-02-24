"use client";

import Copy from "@/components/copy/Copy";
import ThemeBtn from "@/components/themeBtn/ThemeBtn";
import { useUIStore } from "@/store/uiStore";
import {
    faArrowLeft,
    faMobileScreenButton,
    faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import { useRouter } from "next/navigation";
import OtpTimer from "@/components/otpTimer/OtpTimer";
import { useState } from "react";
import { getCookie } from "@/utils/getCookie";

export default function Tfa() {
    const [loading, setLoading] = useState(false);
    const [canResend, setCanResend] = useState(false);
    const router = useRouter();

    const tfaToken = getCookie("tfa_token");
    // state for tfa code
    const [tfaCode, setTfaCode] = useState("");
    // state for tfa code

    const [tfaErrors, setTfaErrors] = useState("");

    const theme = useUIStore((s) => s.theme);

    const resendHandler = async () => {
        setLoading(true);
        setTfaErrors("");
        setTfaCode("");
        setCanResend(false);
        try {
            const res = await axios.post(
                "http://localhost:8000/auth/resend-otp",
                {
                    otp_session_id: tfaToken,
                },
            );

            if (res.status === 200) {
                localStorage.removeItem(`otp_expiry_${tfaToken}`);
                setCanResend(false);
            }
        } catch (err) {
            setTfaErrors(
                err.response?.data?.message || "ارسال مجدد ناموفق بود.",
            );
            setCanResend(true);
        } finally {
            setLoading(false);
        }
    };

    const tfaHandler = async () => {
        setLoading(true);
        if (tfaCode.trim() === "") {
            setTfaErrors("لطفا کد 6 رقمی را وارد کنید.");
            setLoading(false);
            return;
        }
        if (!tfaCode.match(/^\d{6}$/)) {
            setTfaErrors("کد وارد شده نامعتبر می باشد.");
            setLoading(false);
            return;
        }

        try {
            const res = await axios.post(
                "http://localhost:8000/auth/verify-otp",
                {
                    otp_session_id: tfaToken,
                    code: tfaCode,
                },
            );

            if (res.status === 200) {
                const token = res.data.access_token;
                const maxAge = 10 * 24 * 60 * 60;
                document.cookie = `access_token=${token}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
                setLoading(false);
                localStorage.removeItem(`otp_expiry_${tfaToken}`);
                document.cookie = "tfa_token=; max-age=0; path=/";
                router.replace("/dashboard");
            }
        } catch (err) {
            const status = err.response?.status;
            if (status === 401) setTfaErrors("کد وارد شده نادرست می باشد.");
            else
                setTfaErrors(
                    err.response?.data?.message || "کد وارد شده صحیح نیست.",
                );
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div
                className={`login-page h-svh flex justify-center items-center relative ${
                    theme === "dark" ? "bg-gray-900" : "bg-gray-100"
                }`}
            >
                <ThemeBtn />
                <div
                    className={`login-form-container relative overflow-hidden sm:rounded-xl sm:shadow-md w-full h-full sm:w-100 p-5 flex justify-center items-center transition-all duration-300 ${
                        theme === "dark" ? "bg-gray-800" : "bg-white"
                    } ${tfaErrors.length ? "sm:h-100" : "sm:h-95"}
          `}
                >
                    <div className="two-fa-form relative flex w-full flex-col items-center">
                        <button
                            onClick={() => {
                                router.push("/login");
                            }}
                            className={`back absolute left-1 -top-3 cursor-pointer ${
                                theme === "dark"
                                    ? "text-gray-100"
                                    : "text-gray-800"
                            }`}
                        >
                            <FontAwesomeIcon
                                className="text-xl"
                                icon={faArrowLeft}
                            />
                        </button>
                        <div className="icon-container pb-3">
                            <FontAwesomeIcon
                                className="text-blue-600 text-6xl"
                                icon={faMobileScreenButton}
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
                                احراز هویت دو مرحله ای
                            </h1>
                            <p
                                className={`text-sm mt-2 ${
                                    theme === "dark"
                                        ? "text-gray-400"
                                        : "text-gray-500"
                                }`}
                            >
                                کد 6 رقمی را از اپلیکیشن Authenticator خود وارد
                                کنید.
                            </p>
                        </div>

                        <div className="input-and-btn w-full flex flex-col mt-5 items-center gap-4">
                            <input
                                onChange={(e) => {
                                    setTfaCode(e.target.value);
                                    if (tfaErrors.length) setTfaErrors("");
                                }}
                                type="text"
                                value={tfaCode}
                                inputMode="numeric"
                                maxLength={6}
                                className={`w-[95%] text-center tracking-[0.5em] text-xl
                      border rounded-lg p-3 outline-none ${
                          theme === "dark"
                              ? "text-gray-50 bg-gray-700 border-gray-500"
                              : "text-gray-800 border-gray-300"
                      }`}
                            />

                            <button
                                onClick={() => tfaHandler()}
                                className={`text-white w-[95%] bg-blue-600 ${loading ? "cursor-no-drop" : "cursor-pointer"}
                 rounded-lg py-2 mt-2 text-sm flex justify-center items-center gap-1`}
                            >
                                تایید کد
                                {loading && (
                                    <FontAwesomeIcon
                                        icon={faSpinner}
                                        className="animate-spin"
                                    />
                                )}
                            </button>
                            {canResend ? (
                                <button
                                    onClick={() => resendHandler()}
                                    className="border-none text-sm text-gray-300 cursor-pointer"
                                >
                                    ارسال مجدد کد
                                </button>
                            ) : (
                                <span className="flex items-center text-sm text-gray-300">
                                    <OtpTimer
                                        otpSessionId={getCookie("tfa_token")}
                                        onExpire={() => setCanResend(true)}
                                    />
                                    <p className="mr-2 text-sm text-gray-300">
                                        تا ارسال مجدد کد...
                                    </p>
                                </span>
                            )}
                            {tfaErrors.length ? (
                                <div className="tfa-error text-xs text-red-500">
                                    {tfaErrors}
                                </div>
                            ) : (
                                ""
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <Copy theme={theme} />
        </>
    );
}
