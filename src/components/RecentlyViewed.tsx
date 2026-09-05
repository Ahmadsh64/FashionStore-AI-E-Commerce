"use client";

import { useEffect, useState } from "react";
import { useRecent } from "@/store/recent";
import type { Product } from "@/types/product";
import { ProductCard } from "@/components/ProductCard";

export function TrackRecentlyViewed({ productId }: { productId: string }) {
  const add = useRecent((s) => s.add);
  useEffect(() => {
    add(productId);
  }, [add, productId]);
  return null;
}

export function RecentlyViewed({
  products,
  excludeId,
  title = "נצפו לאחרונה",
}: {
  products: Product[];
  excludeId?: string;
  title?: string;
}) {
  const ids = useRecent((s) => s.ids);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const ordered = ids
    .filter((id) => id !== excludeId)
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is Product => !!p)
    .slice(0, 4);

  if (ordered.length === 0) return null;

  return (
    <section className="mt-12 border-t pt-8">
      <h2 className="mb-4 text-2xl font-bold">{title}</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {ordered.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
