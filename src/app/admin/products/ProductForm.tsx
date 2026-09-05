"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Upload, X, Plus, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CATEGORIES, type Product } from "@/types/product";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type Props = { product?: Product };

const COMMON_SIZES: Record<string, string[]> = {
  Men:   ["S", "M", "L", "XL", "XXL"],
  Women: ["XS", "S", "M", "L", "XL"],
  Kids:  ["4", "6", "8", "10", "12"],
  Shoes: ["36", "37", "38", "39", "40", "41", "42", "43", "44", "45"],
};

const COMMON_COLORS = [
  "Black", "White", "Grey", "Navy", "Red", "Blue", "Green",
  "Yellow", "Pink", "Rose", "Beige", "Brown",
];

export function ProductForm({ product }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    name: product?.name ?? "",
    description: product?.description ?? "",
    price: product?.price ?? 0,
    category: product?.category ?? CATEGORIES[0],
    image_url: product?.image_url ?? "",
    images: product?.images ?? [],
    sizes: product?.sizes ?? [],
    colors: product?.colors ?? [],
    stock: product?.stock ?? 0,
  });

  const [newSize, setNewSize] = useState("");
  const [newColor, setNewColor] = useState("");

  const uploadFile = async (
    file: File,
  ): Promise<string> => {
    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage
      .from("products")
      .upload(path, file, { cacheControl: "3600", upsert: false });
    if (error) throw error;
    const { data } = supabase.storage.from("products").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleMainUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadFile(file);
      setForm((f) => ({ ...f, image_url: url }));
      toast.success("התמונה הראשית הועלתה");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "שגיאה בהעלאה");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setUploading(true);
    try {
      const urls = await Promise.all(files.map(uploadFile));
      setForm((f) => ({ ...f, images: [...f.images, ...urls] }));
      toast.success(`הועלו ${urls.length} תמונות לגלריה`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "שגיאה בהעלאה");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removeGalleryImage = (idx: number) => {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
  };

  const setAsMain = (idx: number) => {
    setForm((f) => {
      const next = [...f.images];
      const [selected] = next.splice(idx, 1);
      // מוסיפים את התמונה הראשית הישנה לגלריה (אם היתה)
      if (f.image_url) next.unshift(f.image_url);
      return { ...f, image_url: selected, images: next };
    });
  };

  const toggleSize = (s: string) => {
    setForm((f) => ({
      ...f,
      sizes: f.sizes.includes(s)
        ? f.sizes.filter((x) => x !== s)
        : [...f.sizes, s],
    }));
  };

  const toggleColor = (c: string) => {
    setForm((f) => ({
      ...f,
      colors: f.colors.includes(c)
        ? f.colors.filter((x) => x !== c)
        : [...f.colors, c],
    }));
  };

  const addCustomSize = () => {
    const s = newSize.trim();
    if (!s || form.sizes.includes(s)) return;
    setForm((f) => ({ ...f, sizes: [...f.sizes, s] }));
    setNewSize("");
  };

  const addCustomColor = () => {
    const c = newColor.trim();
    if (!c || form.colors.includes(c)) return;
    setForm((f) => ({ ...f, colors: [...f.colors, c] }));
    setNewColor("");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = product ? `/api/products/${product.id}` : "/api/products";
      const res = await fetch(url, {
        method: product ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "שגיאה");
      toast.success(product ? "עודכן בהצלחה" : "נוצר בהצלחה");
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "שגיאה");
    } finally {
      setLoading(false);
    }
  };

  const commonSizes = COMMON_SIZES[form.category] ?? [];

  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <div>
          <Label htmlFor="name">שם המוצר</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="description">תיאור</Label>
          <Textarea
            id="description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={4}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="price">מחיר (₪)</Label>
            <Input
              id="price"
              type="number"
              min={0}
              step="0.01"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
              required
            />
          </div>
          <div>
            <Label htmlFor="stock">מלאי</Label>
            <Input
              id="stock"
              type="number"
              min={0}
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
              required
            />
          </div>
          <div>
            <Label htmlFor="category">קטגוריה</Label>
            <select
              id="category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* מידות */}
        <div className="rounded-lg border p-4">
          <Label className="text-base">מידות זמינות</Label>
          <p className="mb-3 mt-1 text-xs text-muted-foreground">
            השאר ריק אם אין וריאציות מידה. הלקוח יחוייב לבחור מידה לפני הוספה לסל.
          </p>
          {commonSizes.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {commonSizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSize(s)}
                  className={cn(
                    "rounded-md border-2 px-3 py-1.5 text-sm transition-all",
                    form.sizes.includes(s)
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input bg-background hover:border-muted-foreground/40",
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {form.sizes
              .filter((s) => !commonSizes.includes(s))
              .map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1 rounded-md border-2 border-primary bg-primary px-3 py-1 text-sm text-primary-foreground"
                >
                  {s}
                  <button
                    type="button"
                    onClick={() => toggleSize(s)}
                    className="hover:opacity-70"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            <div className="flex gap-1">
              <Input
                value={newSize}
                onChange={(e) => setNewSize(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustomSize();
                  }
                }}
                placeholder="מידה מותאמת"
                className="h-8 w-32 text-sm"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addCustomSize}
                className="h-8"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>

        {/* צבעים */}
        <div className="rounded-lg border p-4">
          <Label className="text-base">צבעים זמינים</Label>
          <p className="mb-3 mt-1 text-xs text-muted-foreground">
            השאר ריק אם אין וריאציות צבע.
          </p>
          <div className="mb-3 flex flex-wrap gap-2">
            {COMMON_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => toggleColor(c)}
                className={cn(
                  "rounded-md border-2 px-3 py-1.5 text-sm transition-all",
                  form.colors.includes(c)
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-input bg-background hover:border-muted-foreground/40",
                )}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {form.colors
              .filter((c) => !COMMON_COLORS.includes(c))
              .map((c) => (
                <span
                  key={c}
                  className="inline-flex items-center gap-1 rounded-md border-2 border-primary bg-primary px-3 py-1 text-sm text-primary-foreground"
                >
                  {c}
                  <button
                    type="button"
                    onClick={() => toggleColor(c)}
                    className="hover:opacity-70"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            <div className="flex gap-1">
              <Input
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustomColor();
                  }
                }}
                placeholder="צבע מותאם"
                className="h-8 w-32 text-sm"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addCustomColor}
                className="h-8"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={loading || uploading}>
            {loading ? "שומר..." : product ? "עדכן" : "צור מוצר"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            ביטול
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label>תמונה ראשית</Label>
          <div className="relative mt-2 aspect-[4/5] overflow-hidden rounded-lg border bg-muted">
            {form.image_url ? (
              <Image
                src={form.image_url}
                alt="preview"
                fill
                className="object-cover"
                sizes="300px"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                אין תמונה
              </div>
            )}
          </div>
          <label className="mt-2 flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed p-3 text-sm hover:bg-accent">
            <Upload className="h-4 w-4" />
            {uploading ? "מעלה..." : "העלה תמונה ראשית"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleMainUpload}
              disabled={uploading}
            />
          </label>
          <div className="mt-2">
            <Label htmlFor="image_url" className="text-xs">
              או הדבק URL:
            </Label>
            <Input
              id="image_url"
              value={form.image_url}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              placeholder="https://..."
            />
          </div>
        </div>

        {/* גלריית תמונות */}
        <div>
          <Label>גלריית תמונות ({form.images.length})</Label>
          <p className="mt-1 text-xs text-muted-foreground">
            תמונות נוספות שיוצגו בעמוד המוצר. לחץ ⭐ לקבוע כתמונה ראשית.
          </p>
          {form.images.length > 0 && (
            <div className="mt-2 grid grid-cols-3 gap-2">
              {form.images.map((img, idx) => (
                <div
                  key={img + idx}
                  className="group relative aspect-square overflow-hidden rounded-md border bg-muted"
                >
                  <Image src={img} alt="" fill className="object-cover" sizes="100px" />
                  <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setAsMain(idx)}
                      title="קבע כתמונה ראשית"
                    >
                      <Star className="h-3 w-3" />
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => removeGalleryImage(idx)}
                      title="הסר"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <label className="mt-2 flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed p-3 text-sm hover:bg-accent">
            <Upload className="h-4 w-4" />
            {uploading ? "מעלה..." : "הוסף לגלריה"}
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleGalleryUpload}
              disabled={uploading}
            />
          </label>
        </div>
      </div>
    </form>
  );
}
