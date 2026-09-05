import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  id: string;         // product id (סופר לוגי)
  key: string;        // ייחודי לשילוב מוצר+מידה+צבע (מפתח בסל)
  name: string;
  price: number;
  image_url: string;
  quantity: number;
  stock: number;
  size?: string;
  color?: string;
};

type AddInput = Omit<CartItem, "quantity" | "key">;

function makeKey(id: string, size?: string, color?: string) {
  return `${id}::${size ?? ""}::${color ?? ""}`;
}

type CartState = {
  items: CartItem[];
  addProduct: (item: AddInput, quantity?: number) => void;
  removeProduct: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
  replaceItems: (items: CartItem[]) => void;
  clearCart: () => void;
  getTotal: () => number;
  getCount: () => number;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addProduct: (item, quantity = 1) => {
        const key = makeKey(item.id, item.size, item.color);
        const existing = get().items.find((i) => i.key === key);
        if (existing) {
          const newQty = Math.min(existing.quantity + quantity, item.stock);
          set({
            items: get().items.map((i) =>
              i.key === key ? { ...i, quantity: newQty } : i,
            ),
          });
        } else {
          set({
            items: [
              ...get().items,
              { ...item, key, quantity: Math.min(quantity, item.stock) },
            ],
          });
        }
      },

      removeProduct: (key) =>
        set({ items: get().items.filter((i) => i.key !== key) }),

      updateQuantity: (key, quantity) => {
        if (quantity <= 0) {
          set({ items: get().items.filter((i) => i.key !== key) });
          return;
        }
        set({
          items: get().items.map((i) =>
            i.key === key
              ? { ...i, quantity: Math.min(quantity, i.stock) }
              : i,
          ),
        });
      },

      replaceItems: (items) => set({ items }),

      clearCart: () => set({ items: [] }),

      getTotal: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

      getCount: () =>
        get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: "fashion-store-cart",
      version: 2, // reset old cart items when structure changes
    },
  ),
);
