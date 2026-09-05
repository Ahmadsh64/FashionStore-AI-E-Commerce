# 🔗 חיבור Supabase ↔ Vercel — המדריך המלא

מדריך מעשי לחיבור בין שני השירותים, כולל כל התקלות שנתקלנו בהן והפתרונות. **קרא בסדר** — הסעיפים בנויים אחד על השני.

---

## 📐 1. הבנת הארכיטקטורה

לפני כל דבר — חשוב להבין ש-**Vercel** ו-**Supabase** הם שני שירותים נפרדים לחלוטין:

```
      GitHub Repository
             │
             │ git push
             ▼
      ┌─────────────────────────┐
      │        Vercel           │      Environment Variables:
      │  (Next.js Runtime)      │      ├── NEXT_PUBLIC_SUPABASE_URL
      │  ─ React Pages          │      ├── NEXT_PUBLIC_SUPABASE_ANON_KEY
      │  ─ API Routes           │      ├── SUPABASE_SERVICE_ROLE_KEY
      │  ─ Server Components    │      └── OPENAI_API_KEY (אופציונלי)
      └───────────┬─────────────┘
                  │
                  │  HTTPS (JSON REST + WebSocket)
                  │
                  ▼
      ┌─────────────────────────┐
      │       Supabase          │
      │  ─ PostgreSQL DB        │  ← כאן כל הנתונים!
      │  ─ Auth (JWT)           │
      │  ─ Storage (S3)         │
      │  ─ Realtime             │
      └─────────────────────────┘
```

### מה זה אומר בפועל?

| שאלה | תשובה |
|-------|--------|
| **מי מחזיק את הנתונים?** | Supabase (לגמרי) |
| **מי מריץ את הקוד?** | Vercel (רק runtime) |
| **צריך "לייבא" נתונים ל-Vercel?** | ❌ **לא**. Vercel רק ניגש לנתונים דרך HTTPS |
| **מי מנהל תיקונים בסכמה?** | אתה — דרך Supabase SQL Editor |
| **איפה משתנים סודיים?** | ב-Vercel Environment Variables |

---

## 🔑 2. השגת המפתחות מ-Supabase

### א. Project URL + Anon Key (פומביים)

לך ל-[Project Settings → API](https://supabase.com/dashboard/project/_/settings/api).

תראה:

```
Project URL:
https://xxxxxxxxxxxxx.supabase.co        ← זה NEXT_PUBLIC_SUPABASE_URL
                     └─ הסוף חייב להיות .co, לא supabase.com/dashboard!

Project API keys:
  anon public:
    eyJhbGciOiJIUzI1NiIs...              ← זה NEXT_PUBLIC_SUPABASE_ANON_KEY
    (בטוח לחשוף, בקליינט)

  service_role:
    eyJhbGciOiJIUzI1NiIs...              ← זה SUPABASE_SERVICE_ROLE_KEY
    (סודי! עוקף RLS - רק בשרת)
```

### ⚠️ טעות נפוצה #1

הפיתוי הטבעי הוא להעתיק את הכתובת מסרגל הכתובות של הדפדפן:

```
❌ https://supabase.com/dashboard/project/xxxxxxxx     ← זה dashboard ב-Web
✅ https://xxxxxxxx.supabase.co                        ← זה API של הפרויקט
```

התוצאה של הטעות הזו: `net::ERR_NAME_NOT_RESOLVED` או `CORS blocked` בקונסולה של הדפדפן.

---

## ⚙️ 3. הגדרת המפתחות ב-Vercel

### שלב א: פתיחת הגדרות

<https://vercel.com/dashboard> → פרויקט → **Settings** → **Environment Variables**

### שלב ב: הוספת 4 משתנים

| Key | Value | Environments |
|-----|-------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxx.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGci...` | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGci...` (service_role) | Production, Preview, Development |
| `OPENAI_API_KEY` | `sk-proj-...` (אופציונלי) | Production, Preview |

### 🚨 טעות נפוצה #2 — Redeploy עם Build Cache

זו הטעות ה**קריטית** ביותר. אחרי שהוספת/שינית משתני `NEXT_PUBLIC_*`:

```
❌ Redeploy → ✅ "Use existing Build Cache" → Redeploy
   התוצאה: הקוד הישן ממשיך לרוץ עם ה-URL הישן!

✅ Redeploy → ⬜ "Use existing Build Cache" (ללא צ'ק) → Redeploy
   התוצאה: rebuild מלא, הערכים החדשים נצרבים ב-bundle
```

**למה?** ב-Next.js, כל משתנה שמתחיל ב-`NEXT_PUBLIC_` **נצרב** ל-JS bundle בזמן `next build`. אחרי הבנייה — הוא כבר לא נטען כמשתנה סביבה, הוא **חלק מהקוד**.

לעומת זאת, משתנים שרתיים (`SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`) כן נטענים בזמן ריצה ולא דורשים rebuild.

---

## 🔐 4. הגדרת Auth URLs ב-Supabase

**חשוב במיוחד** אחרי שיש לך URL של Vercel. אחרת:
- הרשמות ייכשלו בפרודקשן
- לינק אישור המייל יביא לדף שגיאה

### שלב א: פתח את ההגדרות

<https://supabase.com/dashboard/project/_/auth/url-configuration>

### שלב ב: מלא את השדות

```
Site URL:
https://your-app.vercel.app

Redirect URLs (הוסף שורה לכל אחד):
https://your-app.vercel.app/**
https://*-your-username.vercel.app/**   ← עבור Preview deployments
http://localhost:3000/**                 ← לפיתוח מקומי
```

לחץ **Save**.

### אם יש לך Custom Domain

הוסף גם:
```
https://your-custom-domain.com/**
```

ואל תשכח לעדכן את `Site URL` ל-domain החדש.

---

## 🗃️ 5. הרצת ה-SQL Schema

Vercel לא יכול להריץ SQL על Supabase. **אתה** צריך להריץ ידנית ב-SQL Editor.

### א. יצירת סכמה ראשונית (פעם ראשונה)

<https://supabase.com/dashboard/project/_/sql/new>

הרץ **רק** את [`supabase/schema.sql`](./supabase/schema.sql). זה קובץ מאוחד ואידמפוטנטי (בטוח גם על פרויקט קיים). הוא יוצר/מעדכן:

- טבלאות: `products`, `profiles`, `orders`, `order_items`, `reviews`, `coupons`, `newsletter`, `posts`, `contact_messages`, `abandoned_carts`, `marketing_sends`
- Bucket `products` ב-Storage
- RLS + `is_admin()` (בלי recursion)
- Trigger `handle_new_user()`
- Seed: מוצרים, קופונים (`WELCOME10`, `SUMMER50`), מאמרי בלוג

אין צורך להריץ קבצי migration ישנים — כולם כלולים כאן.

---

## 🔄 6. Flow פיתוח יומיומי

```
1. עורך קוד לוקאלית
      │
      ▼
2. npm run dev  →  בדיקה ב-http://localhost:3000
      │              (משתמש ב-.env.local)
      ▼
3. git add . && git commit -m "..." && git push
      │
      ▼
4. Vercel זיהה push וטריגר build אוטומטי
      │
      ▼
5. Deployment חדש עולה תוך 1-3 דקות
      │
      ▼
6. הפרויקט עודכן ב-https://your-app.vercel.app
```

### מתי צריך פעולה ידנית?

| שינוי | פעולה נדרשת |
|--------|-------------|
| שינוי קוד בלבד | git push → אוטומטי |
| שינוי סכמת DB | git push + הרץ SQL ב-Supabase |
| שינוי משתנה שרת (`SUPABASE_SERVICE_ROLE_KEY`) | עדכן ב-Vercel + Redeploy (Build Cache OK) |
| שינוי `NEXT_PUBLIC_*` | עדכן ב-Vercel + Redeploy **ללא** Build Cache |
| שינוי Auth URLs | עדכן ידנית ב-Supabase Dashboard |

---

## 🩺 7. אבחון תקלות

### שגיאה: `CORS blocked` / `net::ERR_NAME_NOT_RESOLVED`

**סיבה:** `NEXT_PUBLIC_SUPABASE_URL` שגוי (בדרך כלל dashboard URL במקום API URL).

**איך לוודא איזה URL הפרודקשן מריץ?**

```powershell
$html = Invoke-WebRequest -Uri "https://YOUR-APP.vercel.app/" -UseBasicParsing
$html.Content | Select-String -Pattern "supabase\.co|supabase\.com/dashboard" -AllMatches
```

או פשוט פותחים DevTools בדפדפן, כרטיסייה Network, מסננים לפי `supabase`, ורואים לאן הבקשות הולכות.

**תיקון:**
1. עדכן `NEXT_PUBLIC_SUPABASE_URL` ב-Vercel לכתובת ה-API הנכונה (`.co`)
2. Redeploy **בלי** Build Cache

### שגיאה: `500 Internal Server Error` על `/rest/v1/profiles`

**סיבה:** Infinite recursion ב-RLS policy של `profiles` (הפוליסי מבצע sub-select על עצמה).

**תיקון:**
הרץ מחדש את [`supabase/schema.sql`](./supabase/schema.sql). הוא יוצר את `is_admin()` עם `SECURITY DEFINER` ומעדכן את כל הפוליסיות.

### שגיאה: `Invalid login credentials` בהרשמה תקינה

**סיבה:** אישור מייל דרוש (Email Confirmations ON).

**פתרון א' — לפיתוח:**
Supabase Dashboard → Authentication → Providers → Email → בטל "Confirm email" → Save.

**פתרון ב' — לפרודקשן:**
השאר את Email Confirmations פועל, אבל וודא ש-Auth Redirect URLs (סעיף 4) כוללים את דומיין Vercel.

### דף `/products` ריק למרות שיש נתונים ב-DB

בדוק בסדר הזה:

1. **האם ה-API של Supabase באמת מחזיר נתונים?** (בדיקה חיצונית)
   ```powershell
   $anon = "YOUR-ANON-KEY"
   Invoke-RestMethod -Uri "https://xxx.supabase.co/rest/v1/products?limit=1" `
     -Headers @{apikey=$anon; Authorization="Bearer $anon"}
   ```

2. **אם כן → הבעיה ב-Vercel.** ה-JS משתמש ב-URL הישן. Redeploy בלי cache.

3. **אם לא → הבעיה ב-Supabase.** בדוק ב-Table Editor שהטבלה מלאה. אם ריקה — הרץ את ה-seed מ-`schema.sql`.

### הרשמה עובדת אבל אין `profile` בטבלה

**סיבה:** ה-Trigger `on_auth_user_created` לא רץ (או ש-`handle_new_user` נכשלה).

**תיקון:** הרץ מחדש את החלק של הטריגר מ-`schema.sql`, או:

```sql
-- יצור profiles חסרים למשתמשים קיימים:
insert into public.profiles (id, email, name)
select u.id, u.email, coalesce(u.raw_user_meta_data->>'name', '')
from auth.users u
where not exists (select 1 from public.profiles p where p.id = u.id);
```

---

## 🎯 8. Checklist להפעלה ראשונה

```
[ ] יצרתי פרויקט ב-Supabase
[ ] הרצתי את supabase/schema.sql ב-SQL Editor
[ ] העתקתי URL + anon + service_role מ-Settings → API
[ ] יצרתי .env.local לוקאלית והכנסתי את המפתחות
[ ] הרצתי npm run dev ובדקתי שהאתר עובד לוקאלית
[ ] העליתי לגיטהאב (git push)
[ ] יצרתי פרויקט ב-Vercel וקישרתי לריפו
[ ] הגדרתי Root Directory = fashion-store (אם הקוד לא בשורש)
[ ] הוספתי את 4 משתני הסביבה ב-Vercel
[ ] פרסתי — בדקתי שאין שגיאות build
[ ] קיבלתי URL של Vercel והוספתי אותו ל-Supabase Auth URLs
[ ] נרשמתי דרך האתר בפרודקשן וודאתי שההרשמה עובדת
[ ] הפכתי את עצמי לאדמין (update public.profiles ...)
[ ] נכנסתי ל-/admin וודאתי שהכל עובד
```

---

## 🚀 9. פקודות שאני צריך בכל יום

### פיתוח מקומי

```bash
cd fashion-store
npm run dev
```

### עדכון קוד לפרודקשן

```bash
git add .
git commit -m "תיאור השינוי"
git push
# Vercel יטפל בשאר
```

### עדכון סכמת DB

הרץ SQL ידנית ב-<https://supabase.com/dashboard/project/_/sql/new>

### כפיית Redeploy נקי

Vercel Dashboard → Deployments → ⋯ → Redeploy → ⬜ Build Cache → Redeploy

### בדיקת מפתחות שמוגדרים ב-Vercel

Vercel Dashboard → Project → Settings → Environment Variables

---

## 📚 10. משאבים נוספים

- **Supabase Docs:** <https://supabase.com/docs>
- **Vercel Docs:** <https://vercel.com/docs>
- **@supabase/ssr:** <https://supabase.com/docs/guides/auth/server-side/creating-a-client>
- **Next.js Env Vars:** <https://nextjs.org/docs/app/building-your-application/configuring/environment-variables>

---

## ❓ שאלות נפוצות

**ש: אני צריך לגבות את הנתונים מ-Supabase כי אני עובר ל-Vercel?**  
ת: לא. הנתונים נשארים ב-Supabase גם אחרי המעבר. Vercel רק מריץ את הקוד.

**ש: מה קורה אם Supabase נופל? האתר גם ייפול?**  
ת: כן. Vercel יגיש את הדפים אבל בקשות ל-DB יחזירו שגיאות. Supabase Pro מבטיח 99.9% uptime.

**ש: אפשר לפרוס את הפרויקט בלי Supabase?**  
ת: לא בקוד הנוכחי. הפרויקט מבוסס לחלוטין על Supabase. אפשר להחליף ל-DB אחר, אבל זה שינוי משמעותי.

**ש: המחירים של Supabase + Vercel?**  
ת: לפרויקטים קטנים — שניהם חינם (Free tier). ל-scale גדול (>500MB DB, >100GB traffic) שילוב עולה בערך $25-50/חודש.

**ש: איך אני מוסיף עוד מפתחים לפרויקט?**  
ת: GitHub → הזמן להיות Collaborator. Vercel → Team Members. Supabase → Organization Members.

---

**נבנה במסגרת פרויקט FashionStore.** לחזרה למדריך הראשי: [`README.md`](./README.md).
