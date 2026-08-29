"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCart } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatPrice } from "@/lib/utils";
import { checkoutSchema } from "@/lib/validators";

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCart((s) => s.items);
  const total = useCart((s) => s.getTotal());
  const clearCart = useCart((s) => s.clearCart);

  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (mounted && items.length === 0) router.replace("/cart");
  }, [mounted, items.length, router]);

  if (!mounted) return null;

  const shipping = total >= 300 ? 0 : 30;
  const grand = total + shipping;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = checkoutSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...parsed.data,
          items: items.map((i) => ({
            product_id: i.id,
            name: i.name,
            quantity: i.quantity,
            price: i.price,
          })),
          total: grand,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "שגיאה");
      clearCart();
      toast.success("ההזמנה נשלחה בהצלחה!");
      router.push(`/checkout/success?order=${data.order_id}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "שגיאה";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-8">
      <h1 className="mb-6 text-3xl font-bold">Checkout</h1>

      <form onSubmit={submit} className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-lg border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">פרטי משלוח</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="full_name">שם מלא</Label>
                <Input
                  id="full_name"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">אימייל</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="phone">טלפון</Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="address">כתובת (רחוב, עיר, מיקוד)</Label>
                <Textarea
                  id="address"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">אמצעי תשלום</h2>
            <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">מזומן במסירה (Cash on Delivery)</p>
              <p className="mt-1">
                שילוב Stripe/סליקה יתווסף בהמשך. כרגע ההזמנה תישמר במערכת ותוצג לאדמין.
              </p>
            </div>
          </div>
        </div>

        <div className="h-fit rounded-lg border bg-card p-6">
          <h2 className="text-lg font-semibold">סיכום</h2>
          <div className="mt-4 space-y-2 text-sm">
            {items.map((i) => (
              <div key={i.id} className="flex justify-between">
                <span className="text-muted-foreground">
                  {i.name} × {i.quantity}
                </span>
                <span>{formatPrice(i.price * i.quantity)}</span>
              </div>
            ))}
            <div className="flex justify-between border-t pt-2">
              <span className="text-muted-foreground">משלוח</span>
              <span>{shipping === 0 ? "חינם" : formatPrice(shipping)}</span>
            </div>
            <div className="flex justify-between border-t pt-2 text-base font-semibold">
              <span>סה&quot;כ</span>
              <span>{formatPrice(grand)}</span>
            </div>
          </div>
          <Button type="submit" size="lg" className="mt-6 w-full" disabled={loading}>
            {loading ? "שולח..." : "אשר הזמנה"}
          </Button>
        </div>
      </form>
    </div>
  );
}
