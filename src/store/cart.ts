import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  image_url: string;
  quantity: number;
  stock: number;
};

type CartState = {
  items: CartItem[];
  addProduct: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeProduct: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getCount: () => number;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addProduct: (item, quantity = 1) => {
        const existing = get().items.find((i) => i.id === item.id);
        if (existing) {
          const newQty = Math.min(existing.quantity + quantity, item.stock);
          set({
            items: get().items.map((i) =>
              i.id === item.id ? { ...i, quantity: newQty } : i,
            ),
          });
        } else {
          set({
            items: [
              ...get().items,
              { ...item, quantity: Math.min(quantity, item.stock) },
            ],
          });
        }
      },

      removeProduct: (id) =>
        set({ items: get().items.filter((i) => i.id !== id) }),

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          set({ items: get().items.filter((i) => i.id !== id) });
          return;
        }
        set({
          items: get().items.map((i) =>
            i.id === id
              ? { ...i, quantity: Math.min(quantity, i.stock) }
              : i,
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      getTotal: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

      getCount: () =>
        get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: "fashion-store-cart" },
  ),
);
