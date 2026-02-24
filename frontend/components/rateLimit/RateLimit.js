"use client";

import { useEffect, useState } from "react";

function formatTime(seconds) {
    const days = Math.floor(seconds / 86400);
    seconds %= 86400;
    const hours = Math.floor(seconds / 3600);
    seconds %= 3600;
    const minutes = Math.floor(seconds / 60);

    if (days > 0) return `${days} روز`;
    if (hours > 0) return `${hours} ساعت`;
    if (minutes > 0) return `${minutes} دقیقه`;
    return `${seconds} ثانیه`;
}

export default function RateLimit({
    retryAfter,
    storageKey = "login_rate_limit",
    onFinish,
}) {
    const [timeLeft, setTimeLeft] = useState(retryAfter);

    useEffect(() => {
        setTimeLeft(retryAfter);
    }, [retryAfter]);

    useEffect(() => {
        if (timeLeft <= 0) {
            localStorage.removeItem(storageKey);
            onFinish?.();
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((t) => t - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, onFinish, storageKey]);

    if (!timeLeft || timeLeft <= 0) return null;

    return <strong>{formatTime(timeLeft)}</strong>;
}
