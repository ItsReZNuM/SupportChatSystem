import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useUIStore = create(
    persist(
        (set) => ({
            theme: "light",
            toggleTheme: () =>
                set((state) => ({
                    theme: state.theme === "light" ? "dark" : "light",
                })),
            // chatWidgetState

            chatWidgetState: false,
            openChatWidget: () => set(() => ({ chatWidgetState: true })),
            closeChatWidget: () => set(() => ({ chatWidgetState: false })),
            // menu

            menuOpen: false,
            openMenu: () => set({ menuOpen: true }),
            closeMenu: () => set({ menuOpen: false }),
            toggleMenu: () => set((state) => ({ menuOpen: !state.menuOpen })),
        }),
        {
            name: "ui-store",
            partialize: (state) => ({ theme: state.theme }),
        },
    ),
);
