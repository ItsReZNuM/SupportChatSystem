"use client";

import { useUIStore } from "@/store/uiStore";
import { faMoon, faSun } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function ResThemeBtn() {
  const theme = useUIStore((s) => s.theme);
  const toggleTheme = useUIStore((s) => s.toggleTheme);
  return (
    <li
      onClick={toggleTheme}
      className={`whitespace-nowrap cursor-pointer py-3 px-5 ${
        theme == "dark" ? "text-gray-400" : "text-gray-500"
      } text-lg flex items-center gap-3`}
    >
      <div
        className={`flex justify-center items-center cursor-pointer relative size-5 rounded-xl transition-all duration-300`}
      >
        <span
          className={`absolute inset-0 m-auto flex items-center justify-center transition-opacity duration-300
      ${
        theme === "light"
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      }`}
        >
          <FontAwesomeIcon icon={faMoon} />
        </span>

        <span
          className={`absolute inset-0 m-auto flex items-center justify-center transition-opacity duration-300
      ${
        theme === "dark"
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      }`}
        >
          <FontAwesomeIcon icon={faSun} />
        </span>
      </div>
      <p className="item-name text-sm font-bold">تغییر تم</p>
    </li>
  );
}
