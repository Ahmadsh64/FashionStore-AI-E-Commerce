"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Coupon } from "@/lib/coupons";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [form, setForm] = useState({
    code: "",
    type: "percent" as "percent" | "fixed",
    value: 10,
    min_order: 0,
  });
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const res = await fetch("/api/coupons");
    const data = await res.json();
    setCoupons(data.coupons ?? []);
  };

  useEffect(() => {
    load();
  }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "שגיאה");
      toast.success("הקופון נוצר");
      setForm({ code: "", type: "percent", value: 10, min_order: 0 });
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "שגיאה");
    } finally {
      setLoading(false);
    }
  };

  const toggle = async (c: Coupon) => {
    await fetch("/api/coupons", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: c.id, active: !c.active }),
    });
    load();
  };

  return (
    <div>
      <h1 className="text-3xl font-bold">קופונים</h1>
      <form onSubmit={create} className="mt-6 grid gap-3 rounded-lg border bg-card p-4 sm:grid-cols-5">
        <div>
          <Label>קוד</Label>
          <Input
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            required
          />
        </div>
        <div>
          <Label>סוג</Label>
          <select
            className="flex h-10 w-full rounded-md border bg-background px-3 text-sm"
            value={form.type}
            onChange={(e) =>
              setForm({ ...form, type: e.target.value as "percent" | "fixed" })
            }
          >
            <option value="percent">אחוז</option>
            <option value="fixed">סכום ₪</option>
          </select>
        </div>
        <div>
          <Label>ערך</Label>
          <Input
            type="number"
            min={1}
            value={form.value}
            onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
          />
        </div>
        <div>
          <Label>מינ׳ הזמנה</Label>
          <Input
            type="number"
            min={0}
            value={form.min_order}
            onChange={(e) => setForm({ ...form, min_order: Number(e.target.value) })}
          />
        </div>
        <div className="flex items-end">
          <Button type="submit" disabled={loading} className="w-full">
            צור
          </Button>
        </div>
      </form>

      <div className="mt-6 overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-right">
            <tr>
              <th className="p-3">קוד</th>
              <th className="p-3">הנחה</th>
              <th className="p-3">שימושים</th>
              <th className="p-3">סטטוס</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="p-3 font-mono">{c.code}</td>
                <td className="p-3">
                  {c.type === "percent" ? `${c.value}%` : `${c.value}₪`}
                </td>
                <td className="p-3">
                  {c.used_count}
                  {c.max_uses != null ? ` / ${c.max_uses}` : ""}
                </td>
                <td className="p-3">{c.active ? "פעיל" : "כבוי"}</td>
                <td className="p-3">
                  <Button size="sm" variant="outline" onClick={() => toggle(c)}>
                    {c.active ? "כבה" : "הפעל"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
