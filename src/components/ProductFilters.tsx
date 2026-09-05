"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export type FilterOptions = {
  sizes: string[];
  colors: string[];
  brands: string[];
};

const SORTS = [
  { value: "newest", label: "הכי חדש" },
  { value: "price_asc", label: "מחיר: נמוך לגבוה" },
  { value: "price_desc", label: "מחיר: גבוה לנמוך" },
  { value: "popular", label: "הכי פופולרי" },
  { value: "name", label: "א-ת" },
] as const;

type Props = {
  options: FilterOptions;
};

export function ProductFilters({ options }: Props) {
  const router = useRouter();
  const params = useSearchParams();

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params.toString());
    if (!value) next.delete(key);
    else next.set(key, value);
    router.push(`/products?${next.toString()}`);
  };

  const clearFilters = () => {
    const next = new URLSearchParams();
    const category = params.get("category");
    const q = params.get("q");
    if (category) next.set("category", category);
    if (q) next.set("q", q);
    router.push(`/products?${next.toString()}`);
  };

  const activeCount = ["min", "max", "size", "color", "brand", "sort"].filter(
    (k) => params.get(k),
  ).length;

  return (
    <aside className="space-y-5 rounded-lg border bg-card p-4 lg:sticky lg:top-20">
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-2 text-sm font-semibold">
          <SlidersHorizontal className="h-4 w-4" />
          סינון ומיון
        </div>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3" />
            נקה ({activeCount})
          </button>
        )}
      </div>

      <div>
        <Label htmlFor="sort">מיון</Label>
        <select
          id="sort"
          value={params.get("sort") ?? "newest"}
          onChange={(e) =>
            setParam("sort", e.target.value === "newest" ? null : e.target.value)
          }
          className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label>טווח מחיר (₪)</Label>
        <div className="mt-1 grid grid-cols-2 gap-2">
          <Input
            type="number"
            min={0}
            placeholder="מ-"
            defaultValue={params.get("min") ?? ""}
            onBlur={(e) => setParam("min", e.target.value || null)}
          />
          <Input
            type="number"
            min={0}
            placeholder="עד"
            defaultValue={params.get("max") ?? ""}
            onBlur={(e) => setParam("max", e.target.value || null)}
          />
        </div>
      </div>

      {options.sizes.length > 0 && (
        <ChipGroup
          label="מידה"
          values={options.sizes}
          active={params.get("size")}
          onSelect={(v) => setParam("size", v)}
        />
      )}

      {options.colors.length > 0 && (
        <ChipGroup
          label="צבע"
          values={options.colors}
          active={params.get("color")}
          onSelect={(v) => setParam("color", v)}
        />
      )}

      {options.brands.length > 0 && (
        <ChipGroup
          label="מותג"
          values={options.brands}
          active={params.get("brand")}
          onSelect={(v) => setParam("brand", v)}
        />
      )}
    </aside>
  );
}

function ChipGroup({
  label,
  values,
  active,
  onSelect,
}: {
  label: string;
  values: string[];
  active: string | null;
  onSelect: (v: string | null) => void;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {values.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onSelect(active === v ? null : v)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs transition-colors",
              active === v
                ? "border-primary bg-primary text-primary-foreground"
                : "border-input hover:border-muted-foreground/40",
            )}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  );
}

export function SortBar({
  total,
  className,
}: {
  total: number;
  className?: string;
}) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)}>
      {total} מוצרים
    </p>
  );
}
