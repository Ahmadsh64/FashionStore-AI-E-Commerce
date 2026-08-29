import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/types/product";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DeleteProductButton } from "./DeleteProductButton";

export default async function AdminProductsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });
  const products = (data as Product[]) ?? [];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">מוצרים</h1>
        <Link href="/admin/products/new">
          <Button>+ מוצר חדש</Button>
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="p-3 text-right">מוצר</th>
              <th className="p-3 text-right">קטגוריה</th>
              <th className="p-3 text-right">מחיר</th>
              <th className="p-3 text-right">מלאי</th>
              <th className="p-3 text-right">פעולות</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                  אין מוצרים. הוסף אחד ראשון!
                </td>
              </tr>
            )}
            {products.map((p) => (
              <tr key={p.id} className="border-b last:border-0">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-10 shrink-0 overflow-hidden rounded bg-muted">
                      {p.image_url && (
                        <Image
                          src={p.image_url}
                          alt={p.name}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{p.name}</div>
                      <div className="line-clamp-1 text-xs text-muted-foreground">
                        {p.description}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="p-3">
                  <Badge variant="secondary">{p.category}</Badge>
                </td>
                <td className="p-3 font-semibold">{formatPrice(p.price)}</td>
                <td className="p-3">
                  {p.stock === 0 ? (
                    <Badge variant="destructive">אזל</Badge>
                  ) : p.stock <= 3 ? (
                    <Badge variant="warning">{p.stock}</Badge>
                  ) : (
                    <span>{p.stock}</span>
                  )}
                </td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <Link href={`/admin/products/${p.id}`}>
                      <Button size="sm" variant="outline">
                        עריכה
                      </Button>
                    </Link>
                    <DeleteProductButton id={p.id} name={p.name} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
