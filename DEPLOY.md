# 🚀 מדריך פריסה ל-Vercel + חיבור ל-Supabase

**סטטוס נוכחי:** הקוד כבר ב-GitHub ב-[Ahmadsh64/FashionStore-AI-E-Commerce](https://github.com/Ahmadsh64/FashionStore-AI-E-Commerce). Supabase כבר פעיל. נשאר לחבר את שניהם דרך Vercel.

---

## 📝 סקירה כללית

הפריסה **לא מעבירה** את הנתונים מ-Supabase — הם נשארים ב-Supabase Cloud. Vercel רק מריץ את קוד ה-Next.js שלך ומתחבר ל-Supabase דרך HTTPS. הפרדה נקייה:

```
GitHub  ────push────►  Vercel (Next.js runtime)  ────HTTPS────►  Supabase (DB + Auth + Storage)
                                                                     └── כאן הנתונים שלך
```

---

## שלב 1️⃣ — יצירת פרויקט ב-Vercel

1. לך ל-<https://vercel.com/new>
2. התחבר עם GitHub (אם עוד לא)
3. חפש `FashionStore-AI-E-Commerce` ולחץ **Import**
4. במסך הקונפיגורציה:
   - **Framework Preset:** Next.js (יזוהה אוטומטית) ✅
   - **Root Directory:** `fashion-store` ⚠️ **חייב לשנות!** לחץ Edit → הקלד `fashion-store`
   - **Build Command:** `npm run build` (ברירת מחדל)
   - **Install Command:** `npm install`
5. **אל תלחץ Deploy עדיין!** — קודם צריך משתני סביבה 👇

---

## שלב 2️⃣ — משתני סביבה ב-Vercel

עדיין בדף Import, פתח את **Environment Variables** והוסף את 4 המשתנים:

| Name | Value | להעתיק מ- |
|------|-------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://yzbcsypxgvcaecafhxkz.supabase.co` | `.env.local` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGci...oscyF77e-J8oUEaWm01_4Ee8xbz1bcHIwRlFjkai68A` | `.env.local` |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGci...` (הסודי, `service_role`) | `.env.local` |
| `OPENAI_API_KEY` | `sk-...` (אופציונלי) | `.env.local` |

⚠️ **בדיקה חשובה:** ודא ש-`NEXT_PUBLIC_SUPABASE_URL` הוא הכתובת של ה-API (`xxx.supabase.co`), **לא** של ה-Dashboard!

עכשיו לחץ **Deploy**. הבנייה תיקח 1-3 דקות.

---

## שלב 3️⃣ — עדכון Supabase Auth Redirect URLs

**חשוב:** אחרי שהפריסה תסתיים תקבל URL כמו `https://fashion-store-xxxxx.vercel.app`. כדי שההרשמה/כניסה יעבדו גם משם, צריך להוסיף אותו ל-whitelist של Supabase:

1. פתח [Supabase Dashboard → Authentication → URL Configuration](https://supabase.com/dashboard/project/yzbcsypxgvcaecafhxkz/auth/url-configuration)
2. **Site URL:** הגדר את ה-URL של Vercel (למשל `https://fashion-store-xxxxx.vercel.app`)
3. **Redirect URLs:** הוסף את שני אלה:
   ```
   https://fashion-store-xxxxx.vercel.app/**
   http://localhost:3000/**
   ```
4. לחץ **Save**

---

## שלב 4️⃣ — בדיקה ב-Production

1. פתח את ה-URL של Vercel בדפדפן
2. הירשם עם מייל חדש
3. ודא שדף הבית מציג את המוצרים (Seed data מ-`schema.sql`)
4. בדוק שהזמנה נשמרת ומופיעה ב-`/admin/orders`

---

## 🛠️ פקודות שימושיות אחרי הפריסה

### לעדכן את האתר
פשוט push לגיטהאב — Vercel יפרוס אוטומטית:
```bash
git add .
git commit -m "עדכון"
git push
```

### לעדכן משתני סביבה
[Vercel → Project → Settings → Environment Variables](https://vercel.com/dashboard). אחרי שינוי — Redeploy את ה-Deployment האחרון.

### לחבר Domain מותאם
[Vercel → Project → Settings → Domains](https://vercel.com/dashboard) → Add → הכנס את הדומיין. הגדר את ה-DNS לפי ההוראות שם.
**אל תשכח:** להוסיף גם את ה-domain החדש ל-Supabase Auth URLs (שלב 3).

---

## ❓ פתרון בעיות נפוצות

### "Build failed" - שגיאת TypeScript
בדוק לוקאלית: `npm run build`. אם עובר — הבעיה כנראה שלא כל משתני הסביבה מוגדרים ב-Vercel.

### דף הבית ריק אחרי פריסה
- ה-Supabase אולי לא זמין מ-Vercel? בדוק את ה-URL.
- Seed data לא רץ? הרץ את `supabase/schema.sql` ידנית.

### הרשמה נכשלת ב-production
לא הוספת את ה-URL של Vercel ל-Redirect URLs של Supabase. חזור לשלב 3.

### הזמנה נכשלת ("שגיאה ביצירת הזמנה")
בדוק שה-`SUPABASE_SERVICE_ROLE_KEY` מוגדר נכון ב-Vercel (משתמשים בו לעקוף RLS עבור אורחים).

### 500 Internal Server Error על `/profiles`
הרץ מחדש את `supabase/schema.sql` ב-Supabase SQL Editor (כולל תיקון RLS).

---

## 📊 מה קורה מאחורי הקלעים

**Vercel Deploy Pipeline:**
1. Git push מגיע ל-GitHub
2. Vercel webhook מזהה שינוי
3. `npm install` בקונטיינר build
4. `next build` מייצר optimized bundle
5. Deploy ל-Edge Network של Vercel (CDN עולמי)
6. כל בקשה מהמשתמש → Vercel → Server Components רצים ב-Node → Supabase → תגובה

**מה חשוב לדעת:**
- Vercel לא מארח DB. הוא רק runtime.
- Supabase לא מארח קוד frontend. הוא רק DB + Auth + Storage.
- החיבור ביניהם הוא HTTPS calls של `@supabase/supabase-js`.
- Environment Variables ב-Vercel הם התחליף ל-`.env.local` מקומי.

---

## 🎯 סיכום בשלוש שורות

1. **Vercel Import** → Root Directory: `fashion-store` → הוסף 4 env vars → Deploy
2. **Supabase Dashboard** → Auth → URL Configuration → הוסף את ה-URL של Vercel
3. פתח באוויר → תיהנה 🎉
