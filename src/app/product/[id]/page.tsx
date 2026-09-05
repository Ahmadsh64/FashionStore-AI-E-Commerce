import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Package, Truck, RotateCcw } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { type Product, getProductGallery } from "@/types/product";
import type { Review } from "@/types/review";
import { summarizeReviews } from "@/types/review";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ProductGallery } from "@/components/ProductGallery";
import { ProductReviews } from "@/components/ProductReviews";
import { RelatedProducts } from "@/components/RelatedProducts";
import { RecentlyViewed, TrackRecentlyViewed } from "@/components/RecentlyViewed";
import { StarRating } from "@/components/StarRating";
import { AddToCartButton } from "./AddToCartButton";

async function getProduct(id: string): Promise<Product | null> {
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("products").select("*").eq("id", id).single();
    return (data as Product) ?? null;
  } catch {
    return null;
  }
}

async function getReviews(productId: string): Promise<Review[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("reviews")
      .select("*")
      .eq("product_id", productId)
      .order("created_at", { ascending: false });
    return (data as Review[]) ?? [];
  } catch {
    return [];
  }
}

async function getRelated(product: Product): Promise<Product[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("category", product.category)
      .neq("id", product.id)
      .limit(4);
    return (data as Product[]) ?? [];
  } catch {
    return [];
  }
}

async function getRecentCandidates(): Promise<Product[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(24);
    return (data as Product[]) ?? [];
  } catch {
    return [];
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  const [reviews, related, recentPool] = await Promise.all([
    getReviews(id),
    getRelated(product),
    getRecentCandidates(),
  ]);
  const summary = summarizeReviews(reviews);

  return (
    <div className="container py-8">
      <TrackRecentlyViewed productId={product.id} />
      <Link
        href="/products"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        חזרה לקטלוג
      </Link>

      <div className="grid gap-8 md:grid-cols-2">
        <ProductGallery images={getProductGallery(product)} alt={product.name} />

        <div>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{product.category}</Badge>
            {product.brand && <Badge variant="outline">{product.brand}</Badge>}
          </div>
          <h1 className="text-3xl font-bold">{product.name}</h1>
          {summary.count > 0 && (
            <div className="mt-2">
              <StarRating value={summary.average} count={summary.count} size="md" />
            </div>
          )}
          <p className="mt-4 text-3xl font-bold text-primary">
            {formatPrice(product.price)}
          </p>

          <div className="mt-6">
            <p className="whitespace-pre-line text-muted-foreground">
              {product.description || "אין תיאור זמין."}
            </p>
          </div>

          <div className="mt-6">
            {product.stock > 0 ? (
              <span className="inline-flex items-center gap-2 text-sm text-emerald-600">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                במלאי ({product.stock})
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 text-sm text-destructive">
                <span className="h-2 w-2 rounded-full bg-destructive" />
                אזל מהמלאי
              </span>
            )}
          </div>

          <div className="mt-6">
            <AddToCartButton product={product} />
          </div>

          <div className="mt-8 grid gap-3 border-t pt-6 text-sm">
            <div className="flex items-center gap-3">
              <Truck className="h-4 w-4 text-muted-foreground" />
              משלוח חינם בהזמנה מעל ₪300
            </div>
            <div className="flex items-center gap-3">
              <RotateCcw className="h-4 w-4 text-muted-foreground" />
              החזרה חינם עד 30 יום
            </div>
            <div className="flex items-center gap-3">
              <Package className="h-4 w-4 text-muted-foreground" />
              אריזה מוקפדת
            </div>
          </div>
        </div>
      </div>

      <RelatedProducts products={related} />
      <ProductReviews productId={product.id} initialReviews={reviews} />
      <RecentlyViewed products={recentPool} excludeId={product.id} />
    </div>
  );
}
