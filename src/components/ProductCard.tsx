"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/types/product";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Props = { product: Product };

export function ProductCard({ product }: Props) {
  const addProduct = useCart((s) => s.addProduct);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (product.stock <= 0) {
      toast.error("המוצר אזל מהמלאי");
      return;
    }
    addProduct({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      stock: product.stock,
    });
    toast.success(`${product.name} נוסף לסל`);
  };

  const outOfStock = product.stock <= 0;
  const lowStock = product.stock > 0 && product.stock <= 3;

  return (
    <Link
      href={`/product/${product.id}`}
      className="group relative flex flex-col overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            אין תמונה
          </div>
        )}

        <div className="absolute top-2 left-2 flex flex-col gap-1">
          <Badge variant="secondary">{product.category}</Badge>
          {outOfStock && <Badge variant="destructive">אזל</Badge>}
          {lowStock && <Badge variant="warning">נותרו {product.stock}</Badge>}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-1 font-medium">{product.name}</h3>
        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
          {product.description || "\u00A0"}
        </p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-lg font-bold">{formatPrice(product.price)}</span>
          <Button size="sm" onClick={handleAdd} disabled={outOfStock}>
            <ShoppingCart className="h-4 w-4" />
            הוסף
          </Button>
        </div>
      </div>
    </Link>
  );
}
