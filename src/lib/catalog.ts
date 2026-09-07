import type { Product } from "@/types/product";

export function productImage(product?: Product | null) {
  const url = product?.image_url?.trim();
  return url || "";
}

export function firstProductImage(products: Product[], category?: string) {
  const pool = category
    ? products.filter((p) => p.category === category)
    : products;
  return pool.find((p) => productImage(p)) ?? null;
}

export function catalogLookImages(products: Product[], limit = 6) {
  const urls: string[] = [];
  for (const p of products) {
    const url = productImage(p);
    if (url && !urls.includes(url)) urls.push(url);
    if (urls.length >= limit) break;
  }
  return urls;
}
