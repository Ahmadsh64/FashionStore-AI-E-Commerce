import Link from "next/link";
import { Facebook, Instagram, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container grid gap-8 py-12 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 text-lg font-bold">
            <span className="rounded-md bg-primary px-2 py-1 text-primary-foreground">FS</span>
            FashionStore
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            אופנה מודרנית באיכות הכי גבוהה. משלוח לכל הארץ.
          </p>
        </div>

        <div>
          <h4 className="mb-3 font-semibold">חנות</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/products" className="hover:text-foreground">כל המוצרים</Link></li>
            <li><Link href="/products?category=Men" className="hover:text-foreground">גברים</Link></li>
            <li><Link href="/products?category=Women" className="hover:text-foreground">נשים</Link></li>
            <li><Link href="/products?category=Kids" className="hover:text-foreground">ילדים</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 font-semibold">שירות</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>משלוחים</li>
            <li>החזרות</li>
            <li>צור קשר</li>
            <li>שאלות נפוצות</li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 font-semibold">עקבו אחרינו</h4>
          <div className="flex gap-3">
            <a href="#" aria-label="Instagram" className="rounded-full border p-2 hover:bg-accent">
              <Instagram className="h-4 w-4" />
            </a>
            <a href="#" aria-label="Facebook" className="rounded-full border p-2 hover:bg-accent">
              <Facebook className="h-4 w-4" />
            </a>
            <a href="#" aria-label="Twitter" className="rounded-full border p-2 hover:bg-accent">
              <Twitter className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t">
        <div className="container flex flex-col items-center justify-between gap-2 py-4 text-xs text-muted-foreground md:flex-row">
          <p>© {new Date().getFullYear()} FashionStore. כל הזכויות שמורות.</p>
          <p>נבנה עם Next.js 15 + Supabase</p>
        </div>
      </div>
    </footer>
  );
}
