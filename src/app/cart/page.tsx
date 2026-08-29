"use client";

import Link from "next/link";
import { ShoppingBag, ArrowLeft } from "lucide-react";
import { useCart } from "@/store/cart";
import { CartItem } from "@/components/CartItem";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { useEffect, useState } from "react";

export default function CartPage() {
  const items = useCart((s) => s.items);
  const total = useCart((s) => s.getTotal());
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const shipping = total >= 300 || total === 0 ? 0 : 30;
  const grand = total + shipping;

  if (items.length === 0) {
    return (
      <div className="container flex flex-col items-center justify-center py-24 text-center">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <ShoppingBag className="h-10 w-10 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold">הסל שלך ריק</h1>
        <p className="mt-2 text-muted-foreground">
          עדיין לא הוספת שום דבר. בוא נתקן את זה!
        </p>
        <Link href="/products" className="mt-6">
          <Button size="lg">
            <ArrowLeft className="h-4 w-4" />
            לצפייה במוצרים
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="mb-6 text-3xl font-bold">הסל שלך</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          {items.map((item) => (
            <CartItem key={item.id} item={item} />
          ))}
        </div>

        <div className="h-fit rounded-lg border bg-card p-6">
          <h2 className="text-lg font-semibold">סיכום הזמנה</h2>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">סכום ביניים</span>
              <span>{formatPrice(total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">משלוח</span>
              <span>{shipping === 0 ? "חינם" : formatPrice(shipping)}</span>
            </div>
            {shipping > 0 && (
              <p className="text-xs text-muted-foreground">
                עוד {formatPrice(300 - total)} למשלוח חינם
              </p>
            )}
            <div className="mt-3 flex justify-between border-t pt-3 text-base font-semibold">
              <span>סה&quot;כ</span>
              <span>{formatPrice(grand)}</span>
            </div>
          </div>
          <Link href="/checkout">
            <Button size="lg" className="mt-6 w-full">
              המשך לתשלום
            </Button>
          </Link>
          <Link href="/products">
            <Button size="sm" variant="ghost" className="mt-2 w-full">
              המשך קניות
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
