"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useWishlist } from "@/store/wishlist";
import { createClient } from "@/lib/supabase/client";
import type { Product } from "@/types/product";
import { ProductCard } from "@/components/ProductCard";
import { ProductGridSkeleton } from "@/components/ProductSkeleton";
import { Button } from "@/components/ui/button";

export default function WishlistPage() {
  const ids = useWishlist((s) => s.ids);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    if (ids.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }
    const supabase = createClient();
    supabase
      .from("products")
      .select("*")
      .in("id", ids)
      .then(({ data }) => {
        const list = (data as Product[]) ?? [];
        const ordered = ids
          .map((id) => list.find((p) => p.id === id))
          .filter((p): p is Product => !!p);
        setProducts(ordered);
        setLoading(false);
      });
  }, [ids, mounted]);

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold">המועדפים שלי</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        שמור פריטים שאהבת וחזור אליהם בקלות.
      </p>

      {!mounted || loading ? (
        <div className="mt-6">
          <ProductGridSkeleton count={4} />
        </div>
      ) : products.length === 0 ? (
        <div className="mt-10 rounded-lg border-2 border-dashed p-12 text-center">
          <Heart className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-muted-foreground">עדיין אין מוצרים במועדפים.</p>
          <Link href="/products">
            <Button className="mt-4">לקטלוג</Button>
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
