"use client";

import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart, type CartItem as CartItemType } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Props = { item: CartItemType };

export function CartItem({ item }: Props) {
  const updateQuantity = useCart((s) => s.updateQuantity);
  const removeProduct = useCart((s) => s.removeProduct);

  const variantLabel = [item.size, item.color].filter(Boolean).join(" · ");

  return (
    <div className="flex gap-4 rounded-lg border bg-card p-4">
      <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-md bg-muted">
        {item.image_url && (
          <Image src={item.image_url} alt={item.name} fill className="object-cover" sizes="80px" />
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-medium">{item.name}</h3>
            {variantLabel && (
              <p className="text-xs text-muted-foreground">{variantLabel}</p>
            )}
            <p className="text-sm text-muted-foreground">{formatPrice(item.price)}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => removeProduct(item.key)}
            aria-label="הסר"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center rounded-md border">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-none"
              onClick={() => updateQuantity(item.key, item.quantity - 1)}
              aria-label="הפחת"
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-8 text-center text-sm">{item.quantity}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-none"
              onClick={() => updateQuantity(item.key, item.quantity + 1)}
              disabled={item.quantity >= item.stock}
              aria-label="הוסף"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          <span className="font-semibold">{formatPrice(item.price * item.quantity)}</span>
        </div>
      </div>
    </div>
  );
}
