export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  images: string[];
  sizes: string[];
  colors: string[];
  stock: number;
  created_at: string;
};

export type ProductInput = Omit<Product, "id" | "created_at">;

export const CATEGORIES = ["Men", "Women", "Kids", "Shoes", "Accessories"] as const;
export type Category = (typeof CATEGORIES)[number];

/**
 * Returns all product images: image_url first, then additional gallery images.
 * Filters out empty strings.
 */
export function getProductGallery(product: Product): string[] {
  const list: string[] = [];
  if (product.image_url) list.push(product.image_url);
  for (const img of product.images ?? []) {
    if (img && !list.includes(img)) list.push(img);
  }
  return list;
}
