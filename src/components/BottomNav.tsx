"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, Heart, ShoppingBag, User } from "lucide-react";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

const ITEMS = [
  { href: "/", label: "בית", icon: Home },
  { href: "/products", label: "מוצרים", icon: LayoutGrid },
  { href: "/wishlist", label: "מועדפים", icon: Heart, badgeKey: "wishlist" as const },
  { href: "/cart", label: "סל", icon: ShoppingBag, badgeKey: "cart" as const },
  { href: "/account", label: "חשבון", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const cartCount = useCart((s) => s.getCount());
  const wishCount = useWishlist((s) => s.getCount());

  useEffect(() => setMounted(true), []);

  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password")
  ) {
    return null;
  }

  const badge = (key?: "cart" | "wishlist") => {
    if (!mounted || !key) return 0;
    return key === "cart" ? cartCount : wishCount;
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur md:hidden"
      aria-label="ניווט תחתון"
    >
      <ul className="container grid grid-cols-5">
        {ITEMS.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const count = badge(item.badgeKey);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "relative flex flex-col items-center gap-0.5 py-2 text-[11px]",
                  active ? "text-foreground font-semibold" : "text-muted-foreground",
                )}
              >
                <item.icon className={cn("h-5 w-5", active && "text-primary")} />
                {item.label}
                {count > 0 && (
                  <span className="absolute top-1 left-1/2 ml-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
                    {count}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
