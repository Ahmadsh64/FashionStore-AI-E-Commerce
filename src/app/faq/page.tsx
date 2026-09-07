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
    <div className="container max-w-3xl py-16">
      <p className="kicker">שירות</p>
      <h1 className="page-title mt-2">שאלות נפוצות</h1>
      <div className="mt-10 divide-y border-y">
        {FAQ.map((item) => (
          <details key={item.q} className="group py-5">
            <summary className="cursor-pointer list-none font-medium [&::-webkit-details-marker]:hidden">
              {item.q}
            </summary>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
