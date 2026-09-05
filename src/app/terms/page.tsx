import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "תנאי שימוש",
  description: "תנאי השימוש באתר FashionStore.",
};

export default function TermsPage() {
  return (
    <div className="container max-w-3xl py-12">
      <h1 className="text-3xl font-bold">תנאי שימוש</h1>
      <div className="mt-6 space-y-4 text-sm leading-7 text-muted-foreground">
        <p>השימוש באתר FashionStore מהווה הסכמה לתנאים אלה.</p>
        <p>
          המחירים כוללים מע&quot;מ אלא אם צוין אחרת. הזמנה מתקבלת רק לאחר אישור תשלום
          או אישור ידני בהעברה בנקאית / מזומן במסירה.
        </p>
        <p>
          התמונות להמחשה. ייתכנו הבדלי צבע קלים בין המסך למוצר. מלאי מתעדכן בזמן אמת
          אך אינו מובטח עד לסגירת ההזמנה.
        </p>
        <p>
          החזרות לפי מדיניות ההחזרות בעמוד המשלוחים. אין להשתמש באתר למטרות בלתי
          חוקיות, סריקה אוטומטית או פגיעה במערכות.
        </p>
        <p>הדין החל: דיני מדינת ישראל. סמכות השיפוט: בתי המשפט המוסמכים בישראל.</p>
        <p>עודכן לאחרונה: ספטמבר 2026.</p>
      </div>
    </div>
  );
}
