import Link from "next/link";
import { redirect } from "next/navigation";
import { LayoutDashboard, Package, ShoppingCart, Users, Ticket, Newspaper } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?redirect=/admin");
  if (profile.role !== "admin") {
    return (
      <div className="container py-24 text-center">
        <h1 className="text-2xl font-bold">אין הרשאה</h1>
        <p className="mt-2 text-muted-foreground">
          החשבון שלך אינו אדמין. פנה למנהל המערכת לקבלת הרשאות.
        </p>
      </div>
    );
  }

  const nav = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/products", label: "מוצרים", icon: Package },
    { href: "/admin/orders", label: "הזמנות", icon: ShoppingCart },
    { href: "/admin/customers", label: "לקוחות", icon: Users },
    { href: "/admin/coupons", label: "קופונים", icon: Ticket },
    { href: "/admin/blog", label: "מגזין", icon: Newspaper },
  ];

  return (
    <div className="container grid gap-6 py-8 lg:grid-cols-[220px_1fr]">
      <aside className="h-fit rounded-lg border bg-card p-3">
        <div className="mb-2 px-3 py-2 text-xs font-semibold uppercase text-muted-foreground">
          ניהול
        </div>
        <nav className="space-y-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div>{children}</div>
    </div>
  );
}
