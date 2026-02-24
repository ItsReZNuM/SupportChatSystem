'use client'

import { faMoon, faSun } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useUIStore } from "@/store/uiStore";

export default function SideBarThemeBtn({
  title,
  setTitleY,
  setTitleVisible,
  setFloatingTitle,
}) {
  const theme = useUIStore((s) => s.theme);
  const toggleTheme = useUIStore((s) => s.toggleTheme);

  return (
    <>
      <span
        onClick={toggleTheme}
        onMouseEnter={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setTitleY(rect.top + rect.height / 2 - 14);
          setFloatingTitle(title);
          setTitleVisible(true);
        }}
        onMouseLeave={() => {
          setTitleVisible(false);
        }}
        className={`flex justify-center items-center cursor-pointer group relative w-10 h-10 ${
          theme == "dark" ? "text-gray-400" : "text-gray-500"
        } rounded-xl transition-all duration-300 hover:text-white hover:bg-blue-500`}
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
      </span>
    </>
  );
}
