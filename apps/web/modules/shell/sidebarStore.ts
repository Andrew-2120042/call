import { create } from "zustand";

const KEY = "nodslot-sidebar-hidden";

const readHidden = () => {
  try {
    return typeof window !== "undefined" && window.localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
};

/** Whether the desktop sidebar is hidden; remembered per browser. */
export const useSidebar = create<{ hidden: boolean; hydrated: boolean; hydrate: () => void; toggle: () => void }>(
  (set, get) => ({
    hidden: false,
    hydrated: false,
    hydrate: () => {
      if (!get().hydrated) set({ hidden: readHidden(), hydrated: true });
    },
    toggle: () => {
      const hidden = !get().hidden;
      try {
        window.localStorage.setItem(KEY, hidden ? "1" : "0");
      } catch {}
      set({ hidden });
    },
  })
);
