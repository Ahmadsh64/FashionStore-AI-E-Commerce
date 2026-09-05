"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CouponResult } from "@/lib/coupons";

type Props = {
  subtotal: number;
  applied: CouponResult | null;
  onApply: (c: CouponResult | null) => void;
};

export function CouponField({ subtotal, applied, onApply }: Props) {
  const [code, setCode] = useState(applied?.code ?? "");
  const [loading, setLoading] = useState(false);

  const apply = async () => {
    if (!code.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim(), subtotal }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "קופון לא תקף");
      onApply(data as CouponResult);
      toast.success(`הקופון ${data.code} הוחל`);
    } catch (e) {
      onApply(null);
      toast.error(e instanceof Error ? e.message : "שגיאה");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="קוד קופון"
          disabled={!!applied}
        />
        {applied ? (
          <Button type="button" variant="outline" onClick={() => onApply(null)}>
            הסר
          </Button>
        ) : (
          <Button type="button" variant="outline" onClick={apply} disabled={loading}>
            {loading ? "..." : "החל"}
          </Button>
        )}
      </div>
      {applied && (
        <p className="text-xs text-emerald-600">
          {applied.code} · {applied.label} (−{applied.discount}₪)
        </p>
      )}
    </div>
  );
}
