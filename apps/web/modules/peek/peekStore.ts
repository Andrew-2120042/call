import { create } from "zustand";

export type PeekTarget = { kind: "booking" | "waitlist"; uid: string };

type PeekState = { target: PeekTarget | null; open: (target: PeekTarget) => void; close: () => void };

/** One quick-view panel for the whole app; anything showing a booking or waitlist person can open it. */
export const usePeek = create<PeekState>((set) => ({
  target: null,
  open: (target) => set({ target }),
  close: () => set({ target: null }),
}));
