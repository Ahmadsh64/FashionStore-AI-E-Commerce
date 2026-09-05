import type { Product } from "@/types/product";
import { ProductCard } from "@/components/ProductCard";

export function RelatedProducts({ products }: { products: Product[] }) {
  if (products.length === 0) return null;
  return (
    <section className="mt-12 border-t pt-8">
      <h2 className="mb-4 text-2xl font-bold">מוצרים דומים</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
