"use client";
import { useEffect, useState } from "react";

export default function OtpTimer({
    otpSessionId,
    durationInSeconds = 120,
    onExpire,
}) {
    const [timeLeft, setTimeLeft] = useState(null);

    useEffect(() => {
        if (!otpSessionId) {
            setTimeLeft(0);
            onExpire?.();
            return;
        }

        const storageKey = `otp_expiry_${otpSessionId}`;
        let expiryTime = localStorage.getItem(storageKey);

        if (!expiryTime) {
            expiryTime = Date.now() + durationInSeconds * 1000;
            localStorage.setItem(storageKey, expiryTime);
        } else {
            expiryTime = Number(expiryTime);
        }

        const tick = () => {
            const diff = Math.floor((expiryTime - Date.now()) / 1000);

            if (diff <= 0) {
                setTimeLeft(0);
                localStorage.removeItem(storageKey);
                onExpire?.();
            } else {
                setTimeLeft(diff);
            }
        };

        tick();
        const interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    }, [otpSessionId, durationInSeconds, onExpire]);

    if (timeLeft === null || timeLeft <= 0) return null;

    const minutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");
    const seconds = String(timeLeft % 60).padStart(2, "0");

    return (
        <span>
            {minutes}:{seconds}
        </span>
    );
}
