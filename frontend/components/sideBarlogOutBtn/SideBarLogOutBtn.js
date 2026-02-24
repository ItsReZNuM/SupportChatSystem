'use client'

import { logOut } from "@/utils/logOut";

export default function SideBarLogOutBtn({
  title,
  icon,
  setTitleY,
  setTitleVisible,
  setFloatingTitle,
  theme
}) {

  return (
    <>
      <span
        onClick={logOut}
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
{icon}
      </span>
    </>
  );
}
