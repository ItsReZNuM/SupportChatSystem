"use client";

import { logOut } from "@/utils/logOut";

export default function ResLogOutBtn({ title, icon, theme }) {
    return (
        <li
            onClick={logOut}
            className={`whitespace-nowrap cursor-pointer py-3 px-5 ${
                theme == "dark" ? "text-gray-400" : "text-gray-500"
            } text-lg flex items-center gap-3`}
        >
            <div
                className={`flex justify-center items-center cursor-pointer relative size-5 rounded-xl transition-all duration-300`}
            >
                {icon}
            </div>
            <p className="item-name text-sm font-bold">{title}</p>
        </li>
    );
}
