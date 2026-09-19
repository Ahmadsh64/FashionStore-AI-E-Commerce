import type { SupabaseClient } from "@supabase/supabase-js";
import type { Order, OrderItem } from "@/types/order";

export type OrderWithItems = Order & { items: OrderItem[]; order_items: OrderItem[] };

/** Attach order_items without PostgREST embed (works even if FK is missing). */
export async function attachOrderItems<T extends Order>(
  supabase: SupabaseClient,
  orders: T[],
): Promise<Array<T & { items: OrderItem[]; order_items: OrderItem[] }>> {
  if (orders.length === 0) return [];

  const ids = orders.map((o) => o.id);
  const { data: items, error } = await supabase
    .from("order_items")
    .select("*")
    .in("order_id", ids);

  if (error) {
    console.error("Failed to load order_items:", error);
  }

  const byOrder = new Map<string, OrderItem[]>();
  for (const item of (items as OrderItem[] | null) ?? []) {
    const list = byOrder.get(item.order_id) ?? [];
    list.push(item);
    byOrder.set(item.order_id, list);
  }

  return orders.map((order) => {
    const orderItems = byOrder.get(order.id) ?? [];
    return { ...order, items: orderItems, order_items: orderItems };
  });
}
