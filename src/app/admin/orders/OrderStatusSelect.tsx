"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import type { OrderStatus } from "@/types/order";

const STATUSES: OrderStatus[] = ["pending", "paid", "shipped", "delivered", "cancelled"];

export function OrderStatusSelect({
  id,
  current,
}: {
  id: string;
  current: OrderStatus;
}) {
  const router = useRouter();
  const [value, setValue] = useState<OrderStatus>(current);
  const [loading, setLoading] = useState(false);

  const change = async (newStatus: OrderStatus) => {
    setValue(newStatus);
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("שגיאה");
      toast.success("סטטוס עודכן");
      router.refresh();
    } catch {
      setValue(current);
      toast.error("שגיאה בעדכון");
    } finally {
      setLoading(false);
    }
  };

  return (
    <select
      value={value}
      disabled={loading}
      onChange={(e) => change(e.target.value as OrderStatus)}
      className="mt-2 rounded-md border border-input bg-background px-2 py-1 text-xs"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}
