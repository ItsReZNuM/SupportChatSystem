"use client";

import { useUIStore } from "@/store/uiStore";
import { faEquals, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function ResSideBarIcon() {
  const menuOpen = useUIStore((s) => s.menuOpen);
  const toggleMenu = useUIStore((s) => s.toggleMenu);
  return (
    <>
      <div
        onClick={toggleMenu}
        className="res-sidebar-icon cursor-pointer md:hidden size-10 text-white text-xl rounded-lg bg-blue-500 flex justify-center items-center"
      >
        {menuOpen ? (
          <FontAwesomeIcon icon={faXmark} />
        ) : (
          <FontAwesomeIcon icon={faEquals} />
        )}
      </div>
    </>
  );
}
