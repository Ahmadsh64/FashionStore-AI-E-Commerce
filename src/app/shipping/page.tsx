import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "משלוחים והחזרות",
  description: "זמני משלוח, עלויות ומדיניות החזרה של FashionStore.",
};

export default function ShippingPage() {
  return (
    <div className="container max-w-3xl py-12">
      <h1 className="text-3xl font-bold">משלוחים והחזרות</h1>
      <div className="mt-6 space-y-4 leading-7 text-muted-foreground">
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
