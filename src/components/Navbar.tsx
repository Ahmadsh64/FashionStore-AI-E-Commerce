"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ShoppingBag, Menu, X, User, LogOut, Shield, Search, Heart } from "lucide-react";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ThemeToggle";
import { logoutAndFlush } from "@/lib/account-store";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { BrandLogo } from "@/components/BrandLogo";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "בית" },
  { href: "/products", label: "הקולקציה" },
  { href: "/products?category=Women", label: "נשים" },
  { href: "/products?category=Men", label: "גברים" },
  { href: "/blog", label: "מגזין" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [role, setRole] = useState<"customer" | "admin" | null>(null);
  const [query, setQuery] = useState("");
  const count = useCart((s) => s.getCount());
  const wishCount = useWishlist((s) => s.getCount());

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        setEmail(null);
        setRole(null);
        return;
      }
      setEmail(data.user.email ?? null);
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();
      setRole((profile?.role as "customer" | "admin") ?? "customer");
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setEmail(session?.user.email ?? null);
      if (!session) setRole(null);
    });
    return () => sub.subscription.unsubscribe();
  }, [pathname]);

  const handleLogout = async () => {
    await logoutAndFlush();
    router.push("/");
    router.refresh();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) {
      router.push("/products");
      return;
    }
    router.push(`/products?q=${encodeURIComponent(q)}`);
    setOpen(false);
    setSearchOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-background/90 backdrop-blur-md">
      {!pathname.startsWith("/admin") && !pathname.startsWith("/checkout") && (
        <AnnouncementBar />
      )}
      <div className="border-b">
        <div className="container flex h-[4.25rem] items-center justify-between gap-4">
          <BrandLogo />

          <nav className="hidden items-center gap-7 lg:flex">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative text-[13px] tracking-wide text-muted-foreground transition-colors hover:text-foreground",
                  (item.href === "/"
                    ? pathname === "/"
                    : pathname === item.href ||
                      (item.href.startsWith("/products") &&
                        pathname === "/products" &&
                        item.href === "/products")) && "text-foreground",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-0.5 sm:gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:inline-flex"
              aria-label="חיפוש"
              onClick={() => setSearchOpen((v) => !v)}
            >
              <Search className="h-4 w-4" />
            </Button>
            <ThemeToggle />
            <Link href="/wishlist" className="relative hidden sm:block">
              <Button variant="ghost" size="icon" aria-label="מועדפים">
                <Heart className="h-4 w-4" />
                {mounted && wishCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[9px] font-semibold text-white">
                    {wishCount}
                  </span>
                )}
              </Button>
            </Link>
            {role === "admin" && (
              <Link href="/admin" className="hidden lg:block">
                <Button variant="ghost" size="icon" aria-label="Admin">
                  <Shield className="h-4 w-4" />
                </Button>
              </Link>
            )}
            {email ? (
              <>
                <Link href="/account" className="hidden sm:block">
                  <Button variant="ghost" size="icon" aria-label="החשבון שלי">
                    <User className="h-4 w-4" />
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden sm:inline-flex"
                  onClick={handleLogout}
                  aria-label="יציאה"
                  title="יציאה"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Link href="/login" className="hidden sm:block">
                <Button variant="ghost" size="icon" aria-label="כניסה">
                  <User className="h-4 w-4" />
                </Button>
              </Link>
            )}

            <Link href="/cart" className="relative">
              <Button variant="ghost" size="icon" aria-label="Cart">
                <ShoppingBag className="h-4 w-4" />
                {mounted && count > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-semibold text-primary-foreground">
                    {count}
                  </span>
                )}
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setOpen(!open)}
              aria-label="Menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {searchOpen && (
          <div className="hidden border-t md:block">
            <form onSubmit={handleSearch} className="container py-3">
              <div className="relative mx-auto max-w-xl">
                <Search className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="חיפוש לפי שם, קטגוריה או סגנון..."
                  className="border-0 bg-muted/60 pr-9"
                  aria-label="חיפוש מוצרים"
                  autoFocus
                />
              </div>
            </form>
          </div>
        )}
      </div>

      {open && (
        <div className="border-b bg-background lg:hidden">
          <div className="container py-4">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="חפש בקולקציה..."
                  className="pr-9"
                  aria-label="חיפוש מוצרים"
                />
              </div>
            </form>
            <nav className="flex flex-col">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="border-b border-border/60 py-3 text-sm tracking-wide"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/wishlist"
                onClick={() => setOpen(false)}
                className="border-b border-border/60 py-3 text-sm"
              >
                מועדפים
              </Link>
              {email && (
                <Link
                  href="/account"
                  onClick={() => setOpen(false)}
                  className="border-b border-border/60 py-3 text-sm"
                >
                  החשבון שלי
                </Link>
              )}
              {role === "admin" && (
                <Link
                  href="/admin"
                  onClick={() => setOpen(false)}
                  className="border-b border-border/60 py-3 text-sm"
                >
                  Admin
                </Link>
              )}
              {email ? (
                <button
                  onClick={handleLogout}
                  className="py-3 text-right text-sm text-muted-foreground"
                >
                  יציאה
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="py-3 text-sm"
                >
                  כניסה / הרשמה
                </Link>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
