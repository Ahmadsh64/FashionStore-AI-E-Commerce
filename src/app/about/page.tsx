import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "אודות",
  description: "הסיפור מאחורי FashionStore — אופנה ישראלית נגישה.",
};

export default function AboutPage() {
  return (
    <div className="container max-w-3xl py-12">
      <h1 className="text-3xl font-bold">אודות FashionStore</h1>
      <div className="mt-6 space-y-4 leading-7 text-muted-foreground">
        <p>
          FashionStore נולדה מהרצון לקנות בגדים טובים בלי לבזבז שעות בקניון.
          אנחנו בוחרים פריטים עם גזרה ברורה, בד נוח ומחיר הוגן.
        </p>
        <p>
          המשלוחים לכל הארץ, ההחזרות פשוטות, והתמיכה בעברית — גם בצ׳אט וגם ב-WhatsApp.
        </p>
        <p>
          המשרד והמחסן בישראל. כל הזמנה נארזת ידנית.
        </p>
      </div>
    </div>
  );
}
