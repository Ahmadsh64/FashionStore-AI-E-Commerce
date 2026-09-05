import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ProductCard } from "@/components/ProductCard";
import { ProductFilters, type FilterOptions } from "@/components/ProductFilters";
import { CATEGORIES } from "@/types/product";
import type { Product } from "@/types/product";
import type { Review } from "@/types/review";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "קטלוג מוצרים",
  description: "כל הפריטים של FashionStore — סינון לפי קטגוריה, מידה, צבע ומחיר.",
};

type Search = {
  category?: string;
  q?: string;
  sort?: string;
  min?: string;
  max?: string;
  size?: string;
  color?: string;
  brand?: string;
};

async function loadProducts(params: Search): Promise<{
  products: Product[];
  options: FilterOptions;
}> {
  try {
    const supabase = await createClient();
    let query = supabase.from("products").select("*");

    if (params.category) query = query.eq("category", params.category);
    if (params.q) {
      const term = params.q.replace(/[%_]/g, "");
      query = query.or(
        `name.ilike.%${term}%,description.ilike.%${term}%,category.ilike.%${term}%`,
      );
    }

    const { data } = await query;
    let products = (data as Product[]) ?? [];

    const options: FilterOptions = {
      sizes: unique(products.flatMap((p) => p.sizes ?? [])),
      colors: unique(products.flatMap((p) => p.colors ?? [])),
      brands: unique(products.map((p) => p.brand).filter((b): b is string => !!b)),
    };

    const min = params.min ? Number(params.min) : null;
    const max = params.max ? Number(params.max) : null;
    products = products.filter((p) => {
      if (min !== null && !Number.isNaN(min) && Number(p.price) < min) return false;
      if (max !== null && !Number.isNaN(max) && Number(p.price) > max) return false;
      if (params.size && !(p.sizes ?? []).includes(params.size)) return false;
      if (params.color && !(p.colors ?? []).includes(params.color)) return false;
      if (params.brand && p.brand !== params.brand) return false;
      return true;
    });

    if (params.sort === "popular") {
      const { data: reviews } = await supabase
        .from("reviews")
        .select("product_id, rating");
      const scores = new Map<string, { sum: number; n: number }>();
      for (const r of (reviews as Pick<Review, "product_id" | "rating">[]) ?? []) {
        const cur = scores.get(r.product_id) ?? { sum: 0, n: 0 };
        scores.set(r.product_id, { sum: cur.sum + r.rating, n: cur.n + 1 });
      }
      products.sort((a, b) => {
        const sa = scores.get(a.id);
        const sb = scores.get(b.id);
        const avga = sa ? sa.sum / sa.n : 0;
        const avgb = sb ? sb.sum / sb.n : 0;
        return avgb - avga || (sb?.n ?? 0) - (sa?.n ?? 0);
      });
    } else if (params.sort === "price_asc") {
      products.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (params.sort === "price_desc") {
      products.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (params.sort === "name") {
      products.sort((a, b) => a.name.localeCompare(b.name, "he"));
    } else {
      products.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
    }

    return { products, options };
  } catch {
    return { products: [], options: { sizes: [], colors: [], brands: [] } };
  }
}

function unique(list: string[]) {
  return [...new Set(list)].sort((a, b) => a.localeCompare(b, "en"));
}

function hrefWith(params: Search, extra: Record<string, string | undefined>) {
  const next = new URLSearchParams();
  const merged = { ...params, ...extra };
  for (const [k, v] of Object.entries(merged)) {
    if (v) next.set(k, v);
  }
  const q = next.toString();
  return q ? `/products?${q}` : "/products";
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const params = await searchParams;
  const { products, options } = await loadProducts(params);
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
          href={hrefWith({ ...params, category: undefined }, {})}
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
            href={hrefWith(params, { category: c })}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm transition-colors hover:bg-accent",
              active === c && "bg-primary text-primary-foreground border-primary",
            )}
          >
            {c}
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <ProductFilters options={options} />

        {products.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed p-8 text-center text-muted-foreground">
            לא נמצאו מוצרים תואמים.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
