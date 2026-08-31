import { createClient } from "@/lib/supabase/server";
import { formatDate, formatPrice } from "@/lib/utils";
import type { Order } from "@/types/order";
import { Badge } from "@/components/ui/badge";
import { OrderStatusSelect } from "./OrderStatusSelect";
import { PAYMENT_METHOD_LABELS } from "@/lib/validators";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "warning" | "success" | "destructive"> = {
  pending: "warning",
  paid: "secondary",
  shipped: "default",
  delivered: "success",
  cancelled: "destructive",
};

export default async function AdminOrdersPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false });
  const orders = (data as Order[]) ?? [];

  return (
    <div>
      <h1 className="text-3xl font-bold">הזמנות</h1>

      <div className="mt-6 space-y-3">
        {orders.length === 0 && (
          <div className="rounded-lg border-2 border-dashed p-8 text-center text-muted-foreground">
            אין הזמנות עדיין.
          </div>
        )}
        {orders.map((o) => (
          <div key={o.id} className="rounded-lg border bg-card p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground">
                    #{o.id.slice(0, 8)}
                  </span>
                  <Badge variant={STATUS_VARIANT[o.status] ?? "default"}>{o.status}</Badge>
                </div>
                <div className="mt-1 text-sm font-medium">{o.full_name}</div>
                <div className="text-xs text-muted-foreground">
                  {o.email} · {o.phone}
                </div>
                <div className="text-xs text-muted-foreground">{formatDate(o.created_at)}</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold">{formatPrice(Number(o.total))}</div>
                <OrderStatusSelect id={o.id} current={o.status} />
              </div>
            </div>

            {o.order_items && o.order_items.length > 0 && (
              <div className="mt-3 border-t pt-3">
                <div className="text-xs font-semibold text-muted-foreground">פריטים:</div>
                <ul className="mt-1 space-y-1 text-sm">
                  {o.order_items.map((it) => (
                    <li key={it.id} className="flex justify-between">
                      <span>
                        {it.name} × {it.quantity}
                      </span>
                      <span>{formatPrice(Number(it.price) * it.quantity)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-3 grid gap-1 border-t pt-3 text-xs text-muted-foreground">
              <div>
                <span className="font-semibold text-foreground">כתובת:</span>{" "}
                {o.address}
              </div>
              {o.payment_method && (
                <div>
                  <span className="font-semibold text-foreground">אמצעי תשלום:</span>{" "}
                  {PAYMENT_METHOD_LABELS[o.payment_method] ?? o.payment_method}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
