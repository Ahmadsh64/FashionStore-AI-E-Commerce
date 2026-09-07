import type { Product } from "@/types/product";
import { ProductCard } from "@/components/ProductCard";

export function RelatedProducts({ products }: { products: Product[] }) {
  if (products.length === 0) return null;
  return (
    <section className="mt-16 border-t pt-12">
      <p className="kicker">אולי יתאים גם</p>
      <h2 className="section-title mt-2 mb-8">מוצרים דומים</h2>
      <div className="grid gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
