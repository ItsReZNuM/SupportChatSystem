"use client";
import Link from "next/link";
import Badge from "../badge/badge";

export default function SideBarItem({
    icon,
    link,
    title,
    route,
    setTitleY,
    setTitleVisible,
    setFloatingTitle,
    theme,
}) {
    return (
        <span
            onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setTitleY(rect.top + rect.height / 2 - 14);
                setFloatingTitle(title);
                setTitleVisible(true);
            }}
            onMouseLeave={() => {
                setTitleVisible(false);
            }}
            className={`flex justify-center items-center group relative size-10 rounded-xl ${
                route === link && "text-white bg-blue-500"
            } ${theme === "dark" ? "text-gray-400" : "text-gray-500"} transition-all duration-300 hover:text-white hover:bg-blue-500`}
        >
            {/* {title === "داشبورد" && <Badge />} */}
            <Link href={link} className="flex justify-center items-center">
                {icon}
            </Link>
        </span>
    );
}
