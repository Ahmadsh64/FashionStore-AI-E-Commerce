import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { firstProductImage, productImage } from "@/lib/catalog";
import type { Product } from "@/types/product";

export const metadata: Metadata = {
  title: "אודות",
  description: "הסיפור מאחורי FashionStore — בוטיק אופנה ישראלי נגיש.",
};

export default async function AboutPage() {
  let cover: Product | null = null;
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(12);
    cover = firstProductImage((data as Product[]) ?? []);
  } catch {
    cover = null;
  }

  return (
    <div>
      <section className="relative h-[46vh] min-h-[320px] overflow-hidden bg-[#1c1612]">
        {productImage(cover) && (
          <Image
            src={productImage(cover)}
            alt="אודות FashionStore"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        )}
        <div className="absolute inset-0 bg-black/40" />
        <div className="container relative flex h-full flex-col justify-end pb-12 text-white">
          <p className="kicker text-white/70">מאז 2026</p>
          <h1 className="font-display mt-2 text-5xl md:text-6xl">אודות החנות</h1>
        </div>
      </section>

      <div className="container grid gap-12 py-16 md:grid-cols-12">
        <div className="md:col-span-7">
          <h2 className="font-display text-3xl">אופנה בלי רעש.</h2>
          <div className="mt-6 space-y-4 text-[15px] leading-7 text-muted-foreground">
            <p>
              FashionStore נולדה מהרצון לקנות בגדים טובים בלי לבזבז שעות בקניון.
              אנחנו בוחרים פריטים עם גזרה ברורה, בד נוח ומחיר הוגן — ולא ממלאים את האתר בעודף מלאי.
            </p>
            <p>
              המשלוחים לכל הארץ, ההחזרות פשוטות, והתמיכה בעברית — גם בצ׳אט וגם ב-WhatsApp.
              המשרד והמחסן בישראל. כל הזמנה נארזת ידנית.
            </p>
          </div>
          <Link href="/products" className="mt-8 inline-block">
            <Button size="lg">לקולקציה</Button>
          </Link>
        </div>
        <div className="space-y-8 md:col-span-5">
          {[
            { n: "01", t: "בחירה מצומצמת", d: "רק פריטים שהיינו לובשים בעצמנו." },
            { n: "02", t: "שירות אנושי", d: "שאלה על מידה? עונים בעברית, באותו היום." },
            { n: "03", t: "משלוח והחזרה", d: "חינם מעל ₪300, והחזרה עד 30 יום." },
          ].map((item) => (
            <div key={item.n} className="border-t pt-5">
              <p className="kicker">{item.n}</p>
              <h3 className="mt-2 font-display text-2xl">{item.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{item.d}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
