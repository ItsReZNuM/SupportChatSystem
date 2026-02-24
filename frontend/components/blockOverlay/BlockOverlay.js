"use client";
import { useUIStore } from "@/store/uiStore";

export default function BlockOverlay() {
  const menuOpen = useUIStore((s) => s.menuOpen);
  const closeMenu = useUIStore((s) => s.closeMenu);
  return (
    <div
      onClick={closeMenu}
      className={`
        md:hidden
        fixed inset-0 bg-gray-950/50 z-20
        transition-opacity duration-300
        ${
          menuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }
      `}
    />
  );
}
