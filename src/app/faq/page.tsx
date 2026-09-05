import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "שאלות נפוצות",
  description: "משלוחים, החזרות, מידות ותשלום — תשובות קצרות.",
};

const FAQ = [
  {
    q: "תוך כמה זמן מגיע המשלוח?",
    a: "בדרך כלל 2–5 ימי עסקים בתוך ישראל. הזמנות מעל ₪300 — משלוח חינם.",
  },
  {
    q: "אפשר להחזיר?",
    a: "כן, עד 30 יום מהקבלה, כל עוד הפריט לא נלבש ויש תווית. החזרה חינם.",
  },
  {
    q: "איך בוחרים מידה?",
    a: "בעמוד המוצר יש מידות. אם אתם בין מידות — כתבו לנו בוואטסאפ ונעזור.",
  },
  {
    q: "איזה אמצעי תשלום יש?",
    a: "Stripe מאובטח, כרטיס, Bit, PayPal, העברה בנקאית ומזומן במסירה.",
  },
  {
    q: "יש קופון להזמנה ראשונה?",
    a: "כן — WELCOME10 ל-10% הנחה. הזינו בקופה.",
  },
];

export default function FaqPage() {
  return (
    <div className="container max-w-3xl py-12">
      <h1 className="text-3xl font-bold">שאלות נפוצות</h1>
      <div className="mt-8 space-y-3">
        {FAQ.map((item) => (
          <details key={item.q} className="rounded-lg border bg-card p-4">
            <summary className="cursor-pointer font-medium">{item.q}</summary>
            <p className="mt-2 text-sm text-muted-foreground">{item.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
