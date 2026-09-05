"use client";

import { useState } from "react";
import { Minus, Plus, ShoppingCart, Heart } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { useCart } from "@/store/cart";
import { cn } from "@/lib/utils";

export function AddToCartButton({ product }: { product: Product }) {
  const [qty, setQty] = useState(1);
  const [size, setSize] = useState<string | undefined>(
    product.sizes?.length === 1 ? product.sizes[0] : undefined,
  );
  const [color, setColor] = useState<string | undefined>(
    product.colors?.length === 1 ? product.colors[0] : undefined,
  );
  const addProduct = useCart((s) => s.addProduct);

  const hasSizes = (product.sizes ?? []).length > 0;
  const hasColors = (product.colors ?? []).length > 0;

  const handleAdd = () => {
    if (product.stock <= 0) {
      toast.error("המוצר אזל מהמלאי");
      return;
    }
    if (hasSizes && !size) {
      toast.error("יש לבחור מידה");
      return;
    }
    if (hasColors && !color) {
      toast.error("יש לבחור צבע");
      return;
    }

    addProduct(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
        stock: product.stock,
        size,
        color,
      },
      qty,
    );
    toast.success(`${qty} × ${product.name} נוסף לסל`);
  };

  const disabled = product.stock <= 0;

  return (
    <div className="space-y-5">
      {hasSizes && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-semibold">מידה</label>
            {size && (
              <span className="text-xs text-muted-foreground">
                נבחר: <span className="font-medium text-foreground">{size}</span>
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                className={cn(
                  "min-w-[3rem] rounded-md border-2 px-3 py-2 text-sm font-medium transition-all",
                  size === s
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-input bg-background hover:border-muted-foreground/40",
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {hasColors && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-semibold">צבע</label>
            {color && (
              <span className="text-xs text-muted-foreground">
                נבחר: <span className="font-medium text-foreground">{color}</span>
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {product.colors.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={cn(
                  "rounded-md border-2 px-3 py-2 text-sm font-medium transition-all",
                  color === c
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-input bg-background hover:border-muted-foreground/40",
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="flex items-center rounded-md border">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-none"
            onClick={() => setQty(Math.max(1, qty - 1))}
            disabled={disabled}
            aria-label="הפחת"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-10 text-center text-sm font-medium">{qty}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-none"
            onClick={() => setQty(Math.min(product.stock, qty + 1))}
            disabled={disabled}
            aria-label="הוסף"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <Button
          size="lg"
          onClick={handleAdd}
          disabled={disabled}
          className="flex-1"
        >
          <ShoppingCart className="h-4 w-4" />
          הוסף לסל
        </Button>
        <Button
          size="icon"
          variant="outline"
          className="h-11 w-11"
          aria-label="הוסף למועדפים"
        >
          <Heart className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
