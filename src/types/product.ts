export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  stock: number;
  created_at: string;
};

export type ProductInput = Omit<Product, "id" | "created_at">;

export const CATEGORIES = ["Men", "Women", "Kids", "Shoes", "Accessories"] as const;
export type Category = (typeof CATEGORIES)[number];
