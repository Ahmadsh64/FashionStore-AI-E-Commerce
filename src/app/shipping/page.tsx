import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "משלוחים והחזרות",
  description: "זמני משלוח, עלויות ומדיניות החזרה של FashionStore.",
};

export default function ShippingPage() {
  return (
    <div className="container max-w-3xl py-16">
      <p className="kicker">שירות</p>
      <h1 className="page-title mt-2">משלוחים והחזרות</h1>
      <div className="mt-8 space-y-4 text-[15px] leading-7 text-muted-foreground">
        <p>משלוח רגיל: ₪30. משלוח חינם בהזמנה מעל ₪300.</p>
        <p>זמן אספקה משוער: 2–5 ימי עסקים בתוך ישראל.</p>
        <p>
          החזרה: עד 30 יום מקבלת החבילה, עם תווית ובמצב מקורי. לאחר בדיקה יוחזר
          התשלום לאמצעי המקורי תוך מספר ימי עסקים.
        </p>
        <p>פריטים היגייניים או מותאמים אישית אינם ניתנים להחזרה.</p>
      </div>
    </div>
  );
}
