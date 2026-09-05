import Link from "next/link";
import { redirect } from "next/navigation";
import { Package, User, Mail, Shield, ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, getCurrentProfile } from "@/lib/auth";
import { formatDate, formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { Order, OrderItem } from "@/types/order";

const STATUS_META: Record<
  Order["status"],
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  pending:   { label: "ממתין",  variant: "secondary" },
  paid:      { label: "שולם",   variant: "default" },
  shipped:   { label: "נשלח",   variant: "default" },
  delivered: { label: "נמסר",   variant: "default" },
  cancelled: { label: "בוטל",   variant: "destructive" },
};

type OrderWithItems = Order & { items: OrderItem[] };

async function getMyOrders(userId: string, email: string): Promise<OrderWithItems[]> {
  const supabase = await createClient();
  // מחזירים הזמנות שקשורות ל-user_id או לפי אימייל (לגיבוי הזמנות אורח שנעשו לפני הרשמה)
  const { data, error } = await supabase
    .from("orders")
    .select("*, items:order_items(*)")
    .or(`user_id.eq.${userId},email.eq.${email}`)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load orders:", error);
    return [];
  }
  return (data as OrderWithItems[]) ?? [];
}

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account");

  const profile = await getCurrentProfile();
  const orders = await getMyOrders(user.id, user.email ?? "");

  const totalSpent = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + Number(o.total), 0);

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">החשבון שלי</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          נהל את הפרטים שלך וצפה בהזמנות שביצעת.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        {/* פאנל צד: פרטי משתמש */}
        <aside className="h-fit space-y-4 rounded-lg border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate font-semibold">
                {profile?.name || user.email?.split("@")[0]}
              </div>
              <div className="text-xs text-muted-foreground">
                {profile?.role === "admin" ? "מנהל" : "לקוח"}
              </div>
            </div>
          </div>

          <div className="space-y-2 border-t pt-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span className="truncate">{user.email}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Package className="h-4 w-4" />
              <span>{orders.length} הזמנות</span>
            </div>
            {totalSpent > 0 && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="text-base">₪</span>
                <span>סה&quot;כ הוצאת: {formatPrice(totalSpent)}</span>
              </div>
            )}
          </div>

          <div className="space-y-1 border-t pt-4">
            <Link
              href="/wishlist"
              className="flex items-center justify-between rounded-md p-2 text-sm hover:bg-accent"
            >
              <span>המועדפים שלי</span>
              <ChevronLeft className="h-4 w-4" />
            </Link>
            <Link
              href="/products"
              className="flex items-center justify-between rounded-md p-2 text-sm hover:bg-accent"
            >
              <span>המשך קניות</span>
              <ChevronLeft className="h-4 w-4" />
            </Link>
            <Link
              href="/reset-password"
              className="flex items-center justify-between rounded-md p-2 text-sm hover:bg-accent"
            >
              <span>שנה סיסמה</span>
              <ChevronLeft className="h-4 w-4" />
            </Link>
            {profile?.role === "admin" && (
              <Link
                href="/admin"
                className="flex items-center justify-between rounded-md p-2 text-sm hover:bg-accent"
              >
                <span className="inline-flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  אזור ניהול
                </span>
                <ChevronLeft className="h-4 w-4" />
              </Link>
            )}
          </div>
        </aside>

        {/* היסטוריית הזמנות */}
        <div>
          <h2 className="mb-4 text-xl font-semibold">היסטוריית הזמנות</h2>

          {orders.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed p-12 text-center">
              <Package className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
              <p className="text-muted-foreground">עוד לא ביצעת הזמנות.</p>
              <Link
                href="/products"
                className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
              >
                התחל לקנות →
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function OrderCard({ order }: { order: OrderWithItems }) {
  const meta = STATUS_META[order.status] ?? STATUS_META.pending;
  return (
    <div className="rounded-lg border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b pb-3">
        <div>
          <div className="text-xs text-muted-foreground">מספר הזמנה</div>
          <div className="font-mono text-sm">#{order.id.slice(0, 8)}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">תאריך</div>
          <div className="text-sm">{formatDate(order.created_at)}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">סה&quot;כ</div>
          <div className="text-sm font-semibold">{formatPrice(order.total)}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">סטטוס</div>
          <Badge variant={meta.variant}>{meta.label}</Badge>
        </div>
      </div>

      <div className="mt-3 space-y-2">
        {order.items.map((item) => {
          const variant = [item.size, item.color].filter(Boolean).join(" · ");
          return (
            <div
              key={item.id}
              className="flex items-center justify-between gap-2 text-sm"
            >
              <div className="flex items-center gap-2">
                <span className="rounded bg-muted px-2 py-0.5 text-xs">
                  {item.quantity}×
                </span>
                <span>
                  {item.name}
                  {variant && (
                    <span className="text-muted-foreground"> ({variant})</span>
                  )}
                </span>
              </div>
              <span className="text-muted-foreground">
                {formatPrice(Number(item.price) * item.quantity)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
