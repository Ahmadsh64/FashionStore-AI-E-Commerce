"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  activateAccount,
  scheduleAccountSave,
  saveActiveAccount,
  whenStoresHydrated,
} from "@/lib/account-store";
import { useCart } from "@/store/cart";
import { useRecent } from "@/store/recent";
import { useWishlist } from "@/store/wishlist";

/**
 * טוען/שומר סל, מועדפים ונצפו לאחרונה לפי החשבון המחובר.
 */
export function AccountStoreSync() {
  const items = useCart((s) => s.items);
  const wishlist = useWishlist((s) => s.ids);
  const recent = useRecent((s) => s.ids);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    const boot = async () => {
      await whenStoresHydrated();
      if (cancelled) return;
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      await activateAccount(data.session?.user.id ?? null);
    };

    void boot();

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "TOKEN_REFRESHED" || event === "USER_UPDATED") return;
      if (event === "INITIAL_SESSION") return;
      void activateAccount(session?.user.id ?? null);
    });

    const flush = () => {
      void saveActiveAccount();
    };
    window.addEventListener("beforeunload", flush);
    const onHide = () => {
      if (document.visibilityState === "hidden") flush();
    };
    document.addEventListener("visibilitychange", onHide);

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
      window.removeEventListener("beforeunload", flush);
      document.removeEventListener("visibilitychange", onHide);
    };
  }, []);

  useEffect(() => {
    scheduleAccountSave();
  }, [items, wishlist, recent]);

  return null;
}
