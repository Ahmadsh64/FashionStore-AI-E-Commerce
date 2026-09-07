"use client";

import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import type { Product } from "@/types/product";
import { categoryLabel } from "@/types/product";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/store/cart";
import { WishlistButton } from "@/components/WishlistButton";

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
    <Link href={`/product/${product.id}`} className="group flex flex-col">
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
            אין תמונה
          </div>
        )}

        <div className="absolute top-3 right-3 left-3 flex items-start justify-between">
          <div className="flex flex-col gap-1">
            {outOfStock && (
              <span className="bg-background/90 px-2 py-1 text-[10px] tracking-wide">
                אזל מהמלאי
              </span>
            )}
            {lowStock && (
              <span className="bg-background/90 px-2 py-1 text-[10px] tracking-wide">
                נותרו {product.stock}
              </span>
            )}
          </div>
          <WishlistButton
            productId={product.id}
            productName={product.name}
            className="h-9 w-9 border-0 bg-background/80 shadow-none backdrop-blur-sm hover:bg-background"
          />
        </div>

        {!outOfStock && (
          <button
            type="button"
            onClick={handleAdd}
            className="absolute inset-x-3 bottom-3 bg-background/95 py-2.5 text-center text-[11px] tracking-[0.18em] opacity-0 shadow-sm backdrop-blur-sm transition-all duration-300 hover:bg-primary hover:text-primary-foreground group-hover:opacity-100 max-md:opacity-100"
          >
            הוסף לסל
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col pt-3">
        <p className="kicker">{categoryLabel(product.category)}</p>
        <h3 className="mt-1 line-clamp-1 text-[15px] font-medium">{product.name}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{formatPrice(product.price)}</p>
      </div>
    </Link>
  );
}
