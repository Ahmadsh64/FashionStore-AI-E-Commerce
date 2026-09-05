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
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "בית" },
  { href: "/products", label: "מוצרים" },
  { href: "/products?category=Men", label: "גברים" },
  { href: "/products?category=Women", label: "נשים" },
  { href: "/products?category=Kids", label: "ילדים" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
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
    const supabase = createClient();
    await supabase.auth.signOut();
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
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex shrink-0 items-center gap-2 text-lg font-bold tracking-tight">
          <span className="rounded-md bg-primary px-2 py-1 text-primary-foreground">FS</span>
          <span className="hidden sm:inline">FashionStore</span>
        </Link>

        <nav className="hidden items-center gap-5 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                pathname === item.href && "text-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <form onSubmit={handleSearch} className="hidden max-w-sm flex-1 md:flex">
          <div className="relative w-full">
            <Search className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="חפש מוצרים..."
              className="pr-9"
              aria-label="חיפוש מוצרים"
            />
          </div>
        </form>

        <div className="flex items-center gap-1 sm:gap-2">
          <ThemeToggle />
          <Link href="/wishlist" className="relative hidden sm:block">
            <Button variant="ghost" size="icon" aria-label="מועדפים">
              <Heart className="h-5 w-5" />
              {mounted && wishCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                  {wishCount}
                </span>
              )}
            </Button>
          </Link>
          {role === "admin" && (
            <Link href="/admin">
              <Button variant="ghost" size="sm" className="hidden lg:inline-flex">
                <Shield className="h-4 w-4" />
                Admin
              </Button>
            </Link>
          )}
          {email ? (
            <>
              <Link href="/account">
                <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                  <User className="h-4 w-4" />
                  <span className="hidden lg:inline">החשבון שלי</span>
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
            <Link href="/login">
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                <User className="h-4 w-4" />
                כניסה
              </Button>
            </Link>
          )}

          <Link href="/cart" className="relative">
            <Button variant="outline" size="icon" aria-label="Cart">
              <ShoppingBag className="h-5 w-5" />
              {mounted && count > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
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

      {open && (
        <div className="border-t lg:hidden">
          <div className="container py-3">
            <form onSubmit={handleSearch} className="mb-3 md:hidden">
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="חפש מוצרים..."
                  className="pr-9"
                  aria-label="חיפוש מוצרים"
                />
              </div>
            </form>
            <nav className="flex flex-col gap-1">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2 text-sm hover:bg-accent"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/wishlist"
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm hover:bg-accent"
              >
                מועדפים
              </Link>
              {email && (
                <Link
                  href="/account"
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2 text-sm hover:bg-accent"
                >
                  החשבון שלי
                </Link>
              )}
              {role === "admin" && (
                <Link
                  href="/admin"
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2 text-sm hover:bg-accent"
                >
                  Admin
                </Link>
              )}
              {email ? (
                <button
                  onClick={handleLogout}
                  className="rounded-md px-3 py-2 text-right text-sm hover:bg-accent"
                >
                  יציאה ({email})
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2 text-sm hover:bg-accent"
                >
                  כניסה
                </Link>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
