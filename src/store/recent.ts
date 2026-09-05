import { create } from "zustand";
import { persist } from "zustand/middleware";

const MAX = 12;

type RecentState = {
  ids: string[];
  add: (id: string) => void;
};

export const useRecent = create<RecentState>()(
  persist(
    (set, get) => ({
      ids: [],
      add: (id) => {
        const next = [id, ...get().ids.filter((x) => x !== id)].slice(0, MAX);
        set({ ids: next });
      },
    }),
    { name: "fashion-store-recent" },
  ),
);
