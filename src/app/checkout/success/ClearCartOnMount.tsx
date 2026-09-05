"use client";

import { useEffect } from "react";
import { useCart } from "@/store/cart";

/**
 * מנקה את הסל ברגע שהלקוח מגיע לדף ההצלחה
 * (חשוב במיוחד ל-Stripe שמפנה בחזרה אחרי תשלום).
 */
export function ClearCartOnMount() {
  const clearCart = useCart((s) => s.clearCart);
  useEffect(() => {
    clearCart();
    const email = localStorage.getItem("fashion-store-email");
    if (email) {
      fetch(`/api/abandoned-cart?email=${encodeURIComponent(email)}`, {
        method: "DELETE",
      }).catch(() => {});
    }
  }, [clearCart]);
  return null;
}
