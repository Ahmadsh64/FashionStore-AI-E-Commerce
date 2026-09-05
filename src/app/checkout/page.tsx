"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Lock } from "lucide-react";
import { useCart } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatPrice } from "@/lib/utils";
import {
  checkoutSchema,
  creditCardSchema,
  PAYMENT_METHOD_LABELS,
  type PaymentMethod,
} from "@/lib/validators";
import { PaymentMethods, type CreditCardData } from "@/components/PaymentMethods";

const COD_FEE = 15;

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
  const [payment, setPayment] = useState<PaymentMethod>("credit_card");
  const [card, setCard] = useState<CreditCardData>({
    card_holder: "",
    card_number: "",
    expiry: "",
    cvv: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (mounted && items.length === 0) router.replace("/cart");
  }, [mounted, items.length, router]);

  if (!mounted) return null;

  const shipping = total >= 300 ? 0 : 30;
  const codFee = payment === "cash_on_delivery" ? COD_FEE : 0;
  const grand = total + shipping + codFee;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsed = checkoutSchema.safeParse({ ...form, payment_method: payment });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }

    if (payment === "credit_card") {
      const cardParsed = creditCardSchema.safeParse(card);
      if (!cardParsed.success) {
        toast.error(cardParsed.error.issues[0].message);
        return;
      }
    }

    setLoading(true);
    try {
      // אם המשתמש בחר Stripe - מפנים ישירות ל-Stripe Checkout
      if (payment === "stripe") {
        const res = await fetch("/api/checkout/stripe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...parsed.data,
            items: items.map((i) => ({
              product_id: i.id,
              name: i.name,
              quantity: i.quantity,
              price: i.price,
              image_url: i.image_url,
              size: i.size ?? null,
              color: i.color ?? null,
            })),
            total: grand,
            shipping,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "שגיאה ב-Stripe");
        if (data.url) {
          window.location.href = data.url as string;
          return;
        }
        throw new Error("Stripe לא החזיר URL");
      }

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
            size: i.size ?? null,
            color: i.color ?? null,
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
                  autoComplete="name"
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
                  autoComplete="email"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="phone">טלפון</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  autoComplete="tel"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="address">כתובת (רחוב, עיר, מיקוד)</Label>
                <Textarea
                  id="address"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  autoComplete="street-address"
                  required
                />
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">אמצעי תשלום</h2>
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Lock className="h-3 w-3" />
                מאובטח SSL
              </span>
            </div>
            <PaymentMethods
              selected={payment}
              onSelect={setPayment}
              card={card}
              onCardChange={setCard}
            />
          </div>
        </div>

        <div className="h-fit rounded-lg border bg-card p-6 lg:sticky lg:top-20">
          <h2 className="text-lg font-semibold">סיכום</h2>
          <div className="mt-4 space-y-2 text-sm">
            {items.map((i) => {
              const variant = [i.size, i.color].filter(Boolean).join(" · ");
              return (
                <div key={i.key} className="flex justify-between">
                  <span className="text-muted-foreground">
                    {i.name}
                    {variant && ` (${variant})`} × {i.quantity}
                  </span>
                  <span>{formatPrice(i.price * i.quantity)}</span>
                </div>
              );
            })}
            <div className="flex justify-between border-t pt-2">
              <span className="text-muted-foreground">משלוח</span>
              <span>{shipping === 0 ? "חינם" : formatPrice(shipping)}</span>
            </div>
            {codFee > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">עמלת COD</span>
                <span>{formatPrice(codFee)}</span>
              </div>
            )}
            <div className="flex justify-between border-t pt-2 text-base font-semibold">
              <span>סה&quot;כ</span>
              <span>{formatPrice(grand)}</span>
            </div>
          </div>

          <div className="mt-4 rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
            תשלם ב-<span className="font-medium text-foreground">
              {PAYMENT_METHOD_LABELS[payment]}
            </span>
          </div>

          <Button type="submit" size="lg" className="mt-4 w-full" disabled={loading}>
            {loading ? "שולח..." : `אשר הזמנה · ${formatPrice(grand)}`}
          </Button>

          <p className="mt-3 text-center text-xs text-muted-foreground">
            <Lock className="inline h-3 w-3" /> תשלום מאובטח · פרטיך מוצפנים
          </p>
        </div>
      </form>
    </div>
  );
}
