export type Coupon = {
  id: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
  min_order: number;
  max_uses: number | null;
  used_count: number;
  active: boolean;
  expires_at: string | null;
};

export type CouponResult = {
  code: string;
  discount: number;
  label: string;
};

export function computeCouponDiscount(coupon: Coupon, subtotal: number): CouponResult {
  if (!coupon.active) throw new Error("הקופון אינו פעיל");
  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
    throw new Error("הקופון פג תוקף");
  }
  if (coupon.max_uses != null && coupon.used_count >= coupon.max_uses) {
    throw new Error("הקופון מוצה");
  }
  if (subtotal < Number(coupon.min_order)) {
    throw new Error(`מינימום הזמנה ${coupon.min_order}₪`);
  }

  const raw =
    coupon.type === "percent"
      ? (subtotal * Number(coupon.value)) / 100
      : Number(coupon.value);
  const discount = Math.min(Math.round(raw), subtotal);
  const label =
    coupon.type === "percent"
      ? `${coupon.value}% הנחה`
      : `הנחה של ${coupon.value}₪`;

  return { code: coupon.code.toUpperCase(), discount, label };
}
