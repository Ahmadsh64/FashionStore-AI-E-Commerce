import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";
import { Package, ShoppingCart, TrendingUp, Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

async function loadStats() {
  const supabase = await createClient();
  const [products, orders, profiles] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("total"),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
  ]);

  const totalRevenue =
    (orders.data ?? []).reduce((sum, o) => sum + Number(o.total ?? 0), 0) || 0;

  return {
    productCount: products.count ?? 0,
    orderCount: orders.data?.length ?? 0,
    customerCount: profiles.count ?? 0,
    revenue: totalRevenue,
  };
}

export default async function AdminDashboard() {
  const stats = await loadStats();

  const cards = [
    { title: "הכנסות", value: formatPrice(stats.revenue), icon: TrendingUp },
    { title: "הזמנות", value: stats.orderCount, icon: ShoppingCart },
    { title: "מוצרים", value: stats.productCount, icon: Package },
    { title: "לקוחות", value: stats.customerCount, icon: Users },
  ];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Link href="/admin/products/new">
          <Button>+ הוסף מוצר</Button>
        </Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.title} className="rounded-lg border bg-card p-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{c.title}</span>
              <c.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="mt-2 text-2xl font-bold">{c.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Link
          href="/admin/products"
          className="rounded-lg border bg-card p-6 hover:shadow-md"
        >
          <Package className="mb-2 h-6 w-6" />
          <div className="font-semibold">ניהול מוצרים</div>
          <p className="text-sm text-muted-foreground">
            הוסף, ערוך והסר מוצרים מהחנות.
          </p>
        </Link>
        <Link
          href="/admin/orders"
          className="rounded-lg border bg-card p-6 hover:shadow-md"
        >
          <ShoppingCart className="mb-2 h-6 w-6" />
          <div className="font-semibold">ניהול הזמנות</div>
          <p className="text-sm text-muted-foreground">
            צפה בהזמנות וטפל בסטטוסים שלהן.
          </p>
        </Link>
      </div>
    </div>
  );
}
