import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "מדיניות פרטיות",
  description: "איך FashionStore אוספת ומשתמשת במידע אישי.",
};

export default function PrivacyPage() {
  return (
    <div className="container max-w-3xl py-12">
      <h1 className="text-3xl font-bold">מדיניות פרטיות</h1>
      <div className="mt-6 space-y-4 text-sm leading-7 text-muted-foreground">
        <p>
          אנחנו אוספים שם, אימייל, טלפון וכתובת לצורך ביצוע הזמנה, משלוח ושירות לקוחות.
          אם נרשמתם — נשמר גם חשבון משתמש.
        </p>
        <p>
          התשלום ב-Stripe מתבצע אצל ספק הסליקה. אנחנו לא שומרים מספר כרטיס מלא.
        </p>
        <p>
          ניוזלטר נשלח רק למי שנרשם. אפשר להפסיק בכל עת בפנייה אלינו.
          מיילי עגלה נטושה נשלחים רק אם השארתם אימייל בקופה או בחשבון.
        </p>
        <p>
          עוגיות משמשות לסל, מועדפים, ערכת נושא ואנליטיקה (Vercel / Google אם הוגדר).
        </p>
        <p>
          לפי חוק הגנת הפרטיות ניתן לבקש עיון, תיקון או מחיקה של המידע בכתובת
          דרך עמוד צור קשר.
        </p>
        <p>עודכן לאחרונה: ספטמבר 2026.</p>
      </div>
    </div>
  );
}
