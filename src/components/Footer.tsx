import Link from "next/link";
import { Facebook, Instagram } from "lucide-react";
import { NewsletterForm } from "@/components/NewsletterForm";

export function Footer() {
  return (
    <footer className="mt-auto border-t bg-[#1c1612] text-[#f4efe8] dark:bg-black">
      <div className="container grid gap-10 py-16 md:grid-cols-12">
        <div className="md:col-span-4">
          <Link href="/" className="font-display text-2xl text-[#f4efe8]">
            Fashion <span className="text-[10px] tracking-[0.32em] text-white/50">STORE</span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-6 text-white/60">
            בוטיק אופנה ישראלי. פריטים נבחרים, גזרות מדויקות, ומשלוח עד הבית לכל הארץ.
          </p>
          <div className="mt-6 flex gap-3">
            <a href="#" aria-label="Instagram" className="border border-white/20 p-2 text-white/80 hover:bg-white hover:text-[#1c1612]">
              <Instagram className="h-4 w-4" />
            </a>
            <a href="#" aria-label="Facebook" className="border border-white/20 p-2 text-white/80 hover:bg-white hover:text-[#1c1612]">
              <Facebook className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div className="md:col-span-2">
          <h4 className="kicker mb-4 text-white/50">חנות</h4>
          <ul className="space-y-2.5 text-sm text-white/70">
            <li><Link href="/products" className="hover:text-white">כל הקולקציה</Link></li>
            <li><Link href="/products?category=Women" className="hover:text-white">נשים</Link></li>
            <li><Link href="/products?category=Men" className="hover:text-white">גברים</Link></li>
            <li><Link href="/products?category=Kids" className="hover:text-white">ילדים</Link></li>
            <li><Link href="/blog" className="hover:text-white">מגזין</Link></li>
          </ul>
        </div>

        <div className="md:col-span-3">
          <h4 className="kicker mb-4 text-white/50">שירות לקוחות</h4>
          <ul className="space-y-2.5 text-sm text-white/70">
            <li><Link href="/about" className="hover:text-white">אודות</Link></li>
            <li><Link href="/contact" className="hover:text-white">צור קשר</Link></li>
            <li><Link href="/faq" className="hover:text-white">שאלות נפוצות</Link></li>
            <li><Link href="/shipping" className="hover:text-white">משלוחים והחזרות</Link></li>
            <li><Link href="/terms" className="hover:text-white">תנאי שימוש</Link></li>
            <li><Link href="/privacy" className="hover:text-white">מדיניות פרטיות</Link></li>
          </ul>
        </div>

        <div className="md:col-span-3">
          <h4 className="kicker mb-4 text-white/50">ניוזלטר</h4>
          <p className="mb-4 text-sm leading-6 text-white/60">
            קולקציות חדשות, מבצעים מוקדמים והשראה לארון. בלי ספאם.
          </p>
          <NewsletterForm tone="onDark" />
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container flex flex-col items-center justify-between gap-3 py-5 text-[11px] tracking-wide text-white/45 md:flex-row">
          <p>© {new Date().getFullYear()} FashionStore · כל הזכויות שמורות</p>
          <p>משלוח לכל הארץ · החזרות 30 יום · תשלום מאובטח</p>
        </div>
      </div>
    </footer>
  );
}
