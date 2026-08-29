"use client";

import { useState } from "react";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { useCart } from "@/store/cart";

export function AddToCartButton({ product }: { product: Product }) {
  const [qty, setQty] = useState(1);
  const addProduct = useCart((s) => s.addProduct);

  const handleAdd = () => {
    if (product.stock <= 0) {
      toast.error("המוצר אזל מהמלאי");
      return;
    }
    addProduct(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
        stock: product.stock,
      },
      qty,
    );
    toast.success(`${qty} × ${product.name} נוסף לסל`);
  };

  const disabled = product.stock <= 0;

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center rounded-md border">
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-none"
          onClick={() => setQty(Math.max(1, qty - 1))}
          disabled={disabled}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <span className="w-10 text-center">{qty}</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-none"
          onClick={() => setQty(Math.min(product.stock, qty + 1))}
          disabled={disabled}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <Button size="lg" onClick={handleAdd} disabled={disabled} className="flex-1">
        <ShoppingCart className="h-4 w-4" />
        הוסף לסל
      </Button>
    </div>
  );
}
