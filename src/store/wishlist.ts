import { create } from "zustand";
import { persist } from "zustand/middleware";

type WishlistState = {
  ids: string[];
  toggle: (id: string) => void;
  has: (id: string) => boolean;
  remove: (id: string) => void;
  getCount: () => number;
};

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) => {
        const ids = get().ids;
        set({
          ids: ids.includes(id) ? ids.filter((x) => x !== id) : [id, ...ids],
        });
      },
      has: (id) => get().ids.includes(id),
      remove: (id) => set({ ids: get().ids.filter((x) => x !== id) }),
      getCount: () => get().ids.length,
    }),
    { name: "fashion-store-wishlist" },
  ),
);
