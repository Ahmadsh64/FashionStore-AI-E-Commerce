import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Package, Truck, RotateCcw } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/types/product";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
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

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  return (
    <div className="container py-8">
      <Link
        href="/products"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        חזרה לקטלוג
      </Link>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-muted">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              priority
              className="object-cover"
              sizes="(min-width: 768px) 50vw, 100vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              אין תמונה
            </div>
          )}
        </div>

        <div>
          <Badge variant="secondary" className="mb-3">
            {product.category}
          </Badge>
          <h1 className="text-3xl font-bold">{product.name}</h1>
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
    </div>
  );
}
