import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ProductCard } from "@/components/ProductCard";
import { CATEGORIES } from "@/types/product";
import type { Product } from "@/types/product";
import { cn } from "@/lib/utils";

type Search = { category?: string; q?: string; sort?: string };

async function loadProducts({ category, q, sort }: Search): Promise<Product[]> {
  try {
    const supabase = await createClient();
    let query = supabase.from("products").select("*");

    if (category) query = query.eq("category", category);
    if (q) {
      // חיפוש בשם או בתיאור או בקטגוריה
      const term = q.replace(/[%_]/g, "");
      query = query.or(
        `name.ilike.%${term}%,description.ilike.%${term}%,category.ilike.%${term}%`,
      );
    }

    if (sort === "price_asc") query = query.order("price", { ascending: true });
    else if (sort === "price_desc") query = query.order("price", { ascending: false });
    else query = query.order("created_at", { ascending: false });

    const { data } = await query;
    return (data as Product[]) ?? [];
  } catch {
    return [];
  }
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const params = await searchParams;
  const products = await loadProducts(params);
  const active = params.category ?? "";

  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">
          {params.q
            ? `תוצאות חיפוש עבור "${params.q}"`
            : active
              ? active
              : "כל המוצרים"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {products.length} מוצרים
          {params.q && (
            <>
              {" · "}
              <Link href="/products" className="underline hover:text-foreground">
                נקה חיפוש
              </Link>
            </>
          )}
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <Link
          href="/products"
          className={cn(
            "rounded-full border px-4 py-1.5 text-sm transition-colors hover:bg-accent",
            !active && "bg-primary text-primary-foreground border-primary",
          )}
        >
          הכל
        </Link>
        {CATEGORIES.map((c) => (
          <Link
            key={c}
            href={`/products?category=${c}`}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm transition-colors hover:bg-accent",
              active === c && "bg-primary text-primary-foreground border-primary",
            )}
          >
            {c}
          </Link>
        ))}
      </div>

      {products.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed p-8 text-center text-muted-foreground">
          לא נמצאו מוצרים תואמים.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
