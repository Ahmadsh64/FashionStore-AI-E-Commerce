"use client";

import { useEffect, useRef } from "react";
import { useCart } from "@/store/cart";
import { createClient } from "@/lib/supabase/client";

const EMAIL_KEY = "fashion-store-email";

export function setTrackedEmail(email: string) {
  if (typeof window === "undefined") return;
  if (email.includes("@")) localStorage.setItem(EMAIL_KEY, email);
}

export function clearTrackedEmail() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(EMAIL_KEY);
}

export function CartAbandonTracker() {
  const items = useCart((s) => s.items);
  const total = useCart((s) => s.getTotal());
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) setTrackedEmail(data.user.email);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user.email) setTrackedEmail(session.user.email);
      else clearTrackedEmail();
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const email = localStorage.getItem(EMAIL_KEY);
      if (!email || items.length === 0) return;
      fetch("/api/abandoned-cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          items: items.map((i) => ({
            name: i.name,
            quantity: i.quantity,
            price: i.price,
          })),
          total,
        }),
      }).catch(() => {});
    }, 2500);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [items, total]);

  return null;
}
