"use client";

import { CreditCard, Smartphone, Wallet, Banknote, Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,
  type PaymentMethod,
} from "@/lib/validators";

export type CreditCardData = {
  card_holder: string;
  card_number: string;
  expiry: string;
  cvv: string;
};

const METHOD_META: Record<
  PaymentMethod,
  { icon: React.ComponentType<{ className?: string }>; desc: string; color: string }
> = {
  credit_card: {
    icon: CreditCard,
    desc: "Visa · Mastercard · Amex · Isracard",
    color: "text-blue-600",
  },
  bit: {
    icon: Smartphone,
    desc: "תשלום מהיר דרך אפליקציית Bit",
    color: "text-cyan-600",
  },
  paypal: {
    icon: Wallet,
    desc: "תשלום מאובטח דרך חשבון PayPal",
    color: "text-indigo-600",
  },
  paybox: {
    icon: Smartphone,
    desc: "תשלום דרך אפליקציית PayBox",
    color: "text-emerald-600",
  },
  cash_on_delivery: {
    icon: Banknote,
    desc: "תשלם במזומן לשליח בעת המסירה (+₪15)",
    color: "text-amber-600",
  },
  bank_transfer: {
    icon: Building2,
    desc: "פרטי חשבון יישלחו לאחר אישור ההזמנה",
    color: "text-slate-600",
  },
};

type Props = {
  selected: PaymentMethod;
  onSelect: (m: PaymentMethod) => void;
  card: CreditCardData;
  onCardChange: (data: CreditCardData) => void;
};

function formatCardNumber(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 19);
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length < 3) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function detectBrand(cardNumber: string): string {
  const num = cardNumber.replace(/\s/g, "");
  if (/^4/.test(num)) return "Visa";
  if (/^5[1-5]/.test(num) || /^2[2-7]/.test(num)) return "Mastercard";
  if (/^3[47]/.test(num)) return "Amex";
  if (/^(6011|65|64[4-9])/.test(num)) return "Discover";
  return "";
}

export function PaymentMethods({ selected, onSelect, card, onCardChange }: Props) {
  const brand = detectBrand(card.card_number);

  return (
    <div className="space-y-4">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {PAYMENT_METHODS.map((m) => {
          const meta = METHOD_META[m];
          const active = selected === m;
          return (
            <button
              key={m}
              type="button"
              onClick={() => onSelect(m)}
              className={cn(
                "flex items-start gap-3 rounded-lg border-2 p-3 text-right transition-all",
                active
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-input bg-background hover:border-muted-foreground/40",
              )}
            >
              <div
                className={cn(
                  "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-background",
                  active ? "ring-2 ring-primary/30" : "",
                )}
              >
                <meta.icon className={cn("h-5 w-5", meta.color)} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-semibold">
                    {PAYMENT_METHOD_LABELS[m]}
                  </div>
                  <div
                    className={cn(
                      "h-4 w-4 rounded-full border-2",
                      active ? "border-primary bg-primary" : "border-muted-foreground/30",
                    )}
                  >
                    {active && (
                      <div className="h-full w-full scale-50 rounded-full bg-primary-foreground" />
                    )}
                  </div>
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                  {meta.desc}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {selected === "credit_card" && (
        <div className="space-y-4 rounded-lg border bg-muted/30 p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">פרטי כרטיס אשראי</div>
            {brand && (
              <span className="rounded bg-background px-2 py-0.5 text-xs font-semibold shadow-sm">
                {brand}
              </span>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="card_holder">שם בעל הכרטיס</Label>
              <Input
                id="card_holder"
                value={card.card_holder}
                onChange={(e) =>
                  onCardChange({ ...card, card_holder: e.target.value })
                }
                placeholder="ישראל ישראלי"
                autoComplete="cc-name"
              />
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="card_number">מספר כרטיס</Label>
              <Input
                id="card_number"
                inputMode="numeric"
                value={card.card_number}
                onChange={(e) =>
                  onCardChange({
                    ...card,
                    card_number: formatCardNumber(e.target.value),
                  })
                }
                placeholder="1234 5678 9012 3456"
                autoComplete="cc-number"
                maxLength={23}
              />
            </div>

            <div>
              <Label htmlFor="expiry">תוקף (MM/YY)</Label>
              <Input
                id="expiry"
                inputMode="numeric"
                value={card.expiry}
                onChange={(e) =>
                  onCardChange({ ...card, expiry: formatExpiry(e.target.value) })
                }
                placeholder="12/28"
                autoComplete="cc-exp"
                maxLength={5}
              />
            </div>

            <div>
              <Label htmlFor="cvv">CVV</Label>
              <Input
                id="cvv"
                inputMode="numeric"
                value={card.cvv}
                onChange={(e) =>
                  onCardChange({
                    ...card,
                    cvv: e.target.value.replace(/\D/g, "").slice(0, 4),
                  })
                }
                placeholder="123"
                autoComplete="cc-csc"
                maxLength={4}
              />
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            🔒 פרטי הכרטיס מוצפנים ולא נשמרים אצלנו. שילוב מלא של Stripe יתווסף בשלב הפריסה.
          </p>
        </div>
      )}

      {selected === "bit" && (
        <div className="rounded-lg border bg-cyan-50 p-4 text-sm dark:bg-cyan-950/20">
          <p className="font-medium">איך זה עובד:</p>
          <ol className="mt-2 list-decimal space-y-1 pr-5 text-muted-foreground">
            <li>לחץ &quot;אשר הזמנה&quot; למטה</li>
            <li>נשלח בקשת תשלום ל-Bit לטלפון שהזנת</li>
            <li>אשר בתוך האפליקציה תוך 5 דקות</li>
          </ol>
        </div>
      )}

      {selected === "paypal" && (
        <div className="rounded-lg border bg-indigo-50 p-4 text-sm dark:bg-indigo-950/20">
          <p>תועבר לדף התשלום של PayPal לאחר אישור ההזמנה.</p>
        </div>
      )}

      {selected === "paybox" && (
        <div className="rounded-lg border bg-emerald-50 p-4 text-sm dark:bg-emerald-950/20">
          <p>תקבל התראה באפליקציית PayBox לאישור התשלום.</p>
        </div>
      )}

      {selected === "cash_on_delivery" && (
        <div className="rounded-lg border bg-amber-50 p-4 text-sm dark:bg-amber-950/20">
          <p className="font-medium">שים לב:</p>
          <p className="mt-1 text-muted-foreground">
            עמלת מזומן במסירה של ₪15 תתווסף לסכום. השליח יקבל תשלום במזומן בלבד.
          </p>
        </div>
      )}

      {selected === "bank_transfer" && (
        <div className="rounded-lg border bg-slate-50 p-4 text-sm dark:bg-slate-900/20">
          <p className="font-medium">העברה בנקאית:</p>
          <p className="mt-1 text-muted-foreground">
            לאחר אישור ההזמנה נשלח לך מייל עם פרטי חשבון הבנק. ההזמנה תשלח לאחר קבלת ההעברה.
          </p>
        </div>
      )}
    </div>
  );
}
