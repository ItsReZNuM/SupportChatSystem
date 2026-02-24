'use client'
import { useUIStore } from "@/store/uiStore";
import { faMoon, faSun } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function ThemeBtn() {
  const theme = useUIStore((s) => s.theme);
  const toggleTheme = useUIStore((s) => s.toggleTheme);
  return (
    <>
      <button
        onClick={toggleTheme}
        className="absolute z-10 left-5 top-5 border border-gray-400 rounded-lg p-2 cursor-pointer w-10 h-10"
      >
        <span
          className={`absolute inset-0 m-auto flex items-center justify-center transition-opacity duration-300
      ${
        theme === "light"
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      }`}
        >
          <FontAwesomeIcon className="text-gray-600 text-xl" icon={faMoon} />
        </span>

        <span
          className={`absolute inset-0 m-auto flex items-center justify-center transition-opacity duration-300
      ${
        theme === "dark"
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      }`}
        >
          <FontAwesomeIcon className="text-gray-200 text-xl" icon={faSun} />
        </span>
      </button>
    </>
  );
}
