import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Sparkles, Truck, ShieldCheck, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/types/product";

async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(4);
    return (data as Product[]) ?? [];
  } catch {
    return [];
  }
}

const CATEGORIES = [
  {
    name: "Men",
    label: "גברים",
    image: "https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=800",
  },
  {
    name: "Women",
    label: "נשים",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800",
  },
  {
    name: "Kids",
    label: "ילדים",
    image: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=800",
  },
  {
    name: "Shoes",
    label: "נעליים",
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800",
  },
];

export default async function HomePage() {
  const products = await getFeaturedProducts();

  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="container grid items-center gap-8 py-16 md:grid-cols-2 md:py-24">
          <div>
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="h-3 w-3" />
              קולקציית 2026
            </span>
            <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-6xl">
              אופנה שגורמת לך <br />
              <span className="text-primary">להרגיש מדהים.</span>
            </h1>
            <p className="mt-4 max-w-md text-muted-foreground">
              גלה קולקציה מובחרת של פריטים חדשים לגברים, נשים וילדים. איכות
              מעולה, סטייל עכשווי, ומחירים שווים.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/products">
                <Button size="lg">
                  קנה עכשיו
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/products?category=Women">
                <Button size="lg" variant="outline">
                  קולקציית נשים
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted md:aspect-[4/5]">
            <Image
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200"
              alt="Hero"
              fill
              priority
              className="object-cover"
              sizes="(min-width: 768px) 50vw, 100vw"
            />
          </div>
        </div>
      </section>

      <section className="border-y bg-muted/30">
        <div className="container grid gap-6 py-8 md:grid-cols-4">
          {[
            { icon: Truck, title: "משלוח חינם", desc: "בהזמנה מעל ₪300" },
            { icon: ShieldCheck, title: "החזרות קלות", desc: "עד 30 יום" },
            { icon: Headphones, title: "תמיכה 24/7", desc: "כאן בשבילך" },
            { icon: Sparkles, title: "איכות מובטחת", desc: "אחריות מלאה" },
          ].map((f) => (
            <div key={f.title} className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <f.icon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-semibold">{f.title}</div>
                <div className="text-xs text-muted-foreground">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold">קטגוריות</h2>
            <p className="mt-1 text-muted-foreground">מצא בדיוק את מה שאתה מחפש</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((c) => (
            <Link
              key={c.name}
              href={`/products?category=${c.name}`}
              className="group relative aspect-[4/5] overflow-hidden rounded-xl"
            >
              <Image
                src={c.image}
                alt={c.label}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(min-width: 1024px) 25vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-4 right-4 text-white">
                <div className="text-xl font-bold">{c.label}</div>
                <div className="text-xs opacity-80">לצפייה בקולקציה →</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {products.length > 0 && (
        <section className="container py-16">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-bold">חדש בחנות</h2>
              <p className="mt-1 text-muted-foreground">הפריטים הכי חדשים שהגיעו אלינו</p>
            </div>
            <Link href="/products">
              <Button variant="ghost">
                לכל המוצרים
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {products.length === 0 && (
        <section className="container py-16">
          <div className="rounded-lg border-2 border-dashed p-8 text-center">
            <h3 className="text-lg font-semibold">עדיין אין מוצרים 🛍️</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              נראה שהחנות עוד לא מחוברת ל-Supabase או שהטבלה ריקה.
              <br />
              עקוב אחרי הוראות ה-README כדי להריץ את סכמת ה-DB.
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
