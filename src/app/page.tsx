import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Truck, RotateCcw, Sparkles, Shirt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { RecentlyViewed } from "@/components/RecentlyViewed";
import { NewsletterForm } from "@/components/NewsletterForm";
import { HeroVideo } from "@/components/HeroVideo";
import { createClient } from "@/lib/supabase/server";
import { catalogLookImages, firstProductImage, productImage } from "@/lib/catalog";
import type { Product } from "@/types/product";

/** Lookbook loop — clothing store + fashion (Mixkit). */
const HERO_VIDEO =
  "https://assets.mixkit.co/videos/49384/49384-720.mp4";

async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(24);
    if (error) {
      console.error("[home] products:", error.message);
      return [];
    }
    return (data as Product[]) ?? [];
  } catch (err) {
    console.error("[home] supabase:", err);
    return [];
  }
}

const CATEGORY_TILES = [
  {
    name: "Women",
    label: "נשים",
    caption: "שמלות, עליוניות ובסיס לארון",
    className: "md:col-span-2 md:row-span-2 min-h-[420px]",
  },
  {
    name: "Men",
    label: "גברים",
    caption: "חולצות, ג'קטס וגזרות נקיות",
    className: "min-h-[200px]",
  },
  {
    name: "Shoes",
    label: "נעליים",
    caption: "סניקרס ועקב ליום ולערב",
    className: "min-h-[200px]",
  },
];

export default async function HomePage() {
  const products = await getFeaturedProducts();
  const hero = firstProductImage(products);
  const story = firstProductImage(products, "Women") ?? hero;
  const looks = catalogLookImages(products, 6);

  return (
    <div>
      <section className="relative min-h-[78vh] overflow-hidden bg-[#1c1612] md:min-h-[88vh]">
        <HeroVideo
          src={HERO_VIDEO}
          poster={productImage(hero) || undefined}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        <div className="container relative flex min-h-[78vh] flex-col justify-end pb-16 pt-28 text-white md:min-h-[88vh] md:pb-24">
          <p className="kicker text-white/80">קיץ 2026 · נבחר ביד</p>
          <h1 className="font-display mt-4 max-w-2xl text-5xl font-medium leading-[1.1] md:text-7xl">
            בגדים שמרגישים
            <br />
            כמו הבית. נראים כמו את.
          </h1>
          <p className="mt-5 max-w-md text-sm leading-6 text-white/80 md:text-base">
            קולקציה מצומצמת לגברים, נשים וילדים. בד נושם, גזרה מדויקת, ומשלוח עד הדלת.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/products">
              <Button size="lg" className="bg-white text-[#1c1612] hover:bg-white/90">
                לקולקציה
              </Button>
            </Link>
            <Link href="/products?category=Women">
              <Button
                size="lg"
                variant="outline"
                className="border-white/50 text-white hover:bg-white hover:text-[#1c1612]"
              >
                נשים
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="border-y bg-background">
        <div className="container grid gap-8 py-8 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Truck, title: "משלוח חינם", desc: "בהזמנה מעל ₪300 לכל הארץ" },
            { icon: RotateCcw, title: "החזרה קלה", desc: "30 יום, בלי אותיות קטנות" },
            { icon: Shirt, title: "גזרות מדויקות", desc: "מידות ברורות ובד איכותי" },
            { icon: Sparkles, title: "נבחר בקפידה", desc: "לא עודף מלאי — רק מה ששווה" },
          ].map((f) => (
            <div key={f.title} className="flex items-start gap-3">
              <f.icon className="mt-0.5 h-5 w-5 text-gold" />
              <div>
                <div className="text-sm font-medium">{f.title}</div>
                <div className="mt-0.5 text-xs leading-5 text-muted-foreground">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container py-20">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <p className="kicker">עיינו לפי מחלקה</p>
            <h2 className="section-title mt-2">הקולקציות</h2>
          </div>
          <Link href="/products" className="hidden text-sm text-muted-foreground hover:text-foreground md:inline-flex">
            הכל <ArrowLeft className="mr-1 h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-3 md:grid-cols-3 md:grid-rows-2">
          {CATEGORY_TILES.map((c) => {
            const cover = firstProductImage(products, c.name);
            return (
              <Link
                key={c.name}
                href={`/products?category=${c.name}`}
                className={`group relative overflow-hidden bg-[#1c1612] ${c.className}`}
              >
                {productImage(cover) && (
                  <Image
                    src={productImage(cover)}
                    alt={c.label}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(min-width: 768px) 50vw, 100vw"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
                <div className="absolute bottom-5 right-5 text-white">
                  <div className="font-display text-3xl">{c.label}</div>
                  <p className="mt-1 text-xs text-white/75">{c.caption}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {products.length > 0 && (
        <section className="container pb-20">
          <div className="mb-10 flex items-end justify-between gap-4">
            <div>
              <p className="kicker">זה עתה הגיע</p>
              <h2 className="section-title mt-2">חדש בחנות</h2>
            </div>
            <Link href="/products">
              <Button variant="ghost" className="text-muted-foreground">
                לכל המוצרים
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {products.slice(0, 8).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <section className="bg-[#1c1612] text-[#f4efe8]">
        <div className="container grid items-center gap-10 py-20 md:grid-cols-2 md:gap-16">
          <div className="relative aspect-[4/5] overflow-hidden bg-black/30">
            {productImage(story) && (
              <Image
                src={productImage(story)}
                alt={story?.name ?? "הקולקציה"}
                fill
                className="object-cover"
                sizes="(min-width: 768px) 50vw, 100vw"
              />
            )}
          </div>
          <div>
            <p className="kicker text-white/50">הסיפור שלנו</p>
            <h2 className="font-display mt-3 text-4xl font-medium md:text-5xl">
              פחות פריטים.
              <br />
              יותר נוכחות.
            </h2>
            <p className="mt-5 max-w-md text-sm leading-7 text-white/65">
              FashionStore נולדה מהרצון לקנות בגדים טובים בלי ללכת לאיבוד בקניון.
              אנחנו בוחרים מעט, בודקים בד וגזרה, ומשלחים מכל הזמנה מהמחסן בישראל.
            </p>
            <Link href="/about" className="mt-8 inline-block">
              <Button
                size="lg"
                variant="outline"
                className="border-white/40 text-white hover:bg-white hover:text-[#1c1612]"
              >
                אודות החנות
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {looks.length > 0 && (
        <section>
          <div className="grid grid-cols-2 md:grid-cols-6">
            {looks.map((src, i) => (
              <div key={`${src}-${i}`} className="relative aspect-square overflow-hidden bg-muted">
                <Image
                  src={src}
                  alt={`פריט ${i + 1}`}
                  fill
                  className="object-cover transition-transform duration-700 hover:scale-110"
                  sizes="16vw"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="border-y bg-secondary/50">
        <div className="container max-w-xl py-16 text-center">
          <p className="kicker">10% להזמנה ראשונה</p>
          <h2 className="section-title mt-3">הצטרפו לרשימה</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            קוד WELCOME10 מחכה בקופה. נעדכן רק כשיש קולקציה חדשה או מבצע אמיתי.
          </p>
          <div className="mx-auto mt-6 max-w-md">
            <NewsletterForm />
          </div>
        </div>
      </section>

      {products.length > 0 && (
        <section className="container py-16">
          <RecentlyViewed products={products} />
        </section>
      )}

      {products.length === 0 && (
        <section className="container py-16">
          <div className="border border-dashed p-10 text-center">
            <h3 className="font-display text-2xl">אין מוצרים בקטלוג עדיין</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              הוסיפו מוצרים מ־Admin, עם תמונה מ־Supabase Storage.
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
