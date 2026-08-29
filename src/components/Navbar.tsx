"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ShoppingBag, Menu, X, User, LogOut, Shield } from "lucide-react";
import { useCart } from "@/store/cart";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
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
  const count = useCart((s) => s.getCount());

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

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
          <span className="rounded-md bg-primary px-2 py-1 text-primary-foreground">FS</span>
          <span>FashionStore</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
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

        <div className="flex items-center gap-2">
          {role === "admin" && (
            <Link href="/admin">
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Shield className="h-4 w-4" />
                Admin
              </Button>
            </Link>
          )}
          {email ? (
            <Button
              variant="ghost"
              size="sm"
              className="hidden sm:inline-flex"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              יציאה
            </Button>
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
            className="md:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {open && (
        <div className="border-t md:hidden">
          <nav className="container flex flex-col gap-1 py-3">
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
      )}
    </header>
  );
}
