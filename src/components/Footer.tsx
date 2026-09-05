import Link from "next/link";
import { Facebook, Instagram, Twitter } from "lucide-react";
import { NewsletterForm } from "@/components/NewsletterForm";

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
            <li><Link href="/blog" className="hover:text-foreground">מגזין</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 font-semibold">שירות</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/about" className="hover:text-foreground">אודות</Link></li>
            <li><Link href="/contact" className="hover:text-foreground">צור קשר</Link></li>
            <li><Link href="/faq" className="hover:text-foreground">שאלות נפוצות</Link></li>
            <li><Link href="/shipping" className="hover:text-foreground">משלוחים והחזרות</Link></li>
            <li><Link href="/terms" className="hover:text-foreground">תנאי שימוש</Link></li>
            <li><Link href="/privacy" className="hover:text-foreground">מדיניות פרטיות</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 font-semibold">ניוזלטר</h4>
          <p className="mb-3 text-sm text-muted-foreground">
            מבצעים, קולקציות חדשות וטיפים. בלי ספאם.
          </p>
          <NewsletterForm />
          <div className="mt-4 flex gap-3">
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
