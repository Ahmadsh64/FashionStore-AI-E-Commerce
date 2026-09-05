# FashionStore — AI E-Commerce

חנות בגדים מלאה מבוססת **Next.js 15 (App Router) + Supabase + Tailwind + TypeScript**.

כוללת:

- דף בית מודרני עם קטגוריות ו־Hero
- קטלוג מוצרים עם סינון לפי קטגוריה + **חיפוש חופשי** ב-Navbar
- עמוד מוצר עם **גלריית תמונות + zoom מלא**
- **וריאציות מוצר** (מידה + צבע) עם בדיקה בהוספה לסל
- סל קניות מלא (Zustand + persist ל־localStorage)
- Checkout עם **6 אמצעי תשלום** כולל **Stripe Checkout Session**
- **Webhook של Stripe** לאישור אוטומטי של תשלומים
- **מיילי אישור הזמנה** עם Resend (אישור + עדכוני סטטוס)
- Auth: הרשמה/כניסה + **שכחתי סיסמה + איפוס** דרך Supabase Auth
- **דף חשבון אישי** עם היסטוריית הזמנות ומעקב סטטוס
- **Admin Panel** מלא: Dashboard, ניהול מוצרים (CRUD), העלאת תמונות ל־Supabase Storage, ניהול וריאציות + גלריה, ניהול הזמנות ולקוחות
- **AI Assistant** (chat widget) עם fallback מקומי — עם/בלי OpenAI API
- Row Level Security (RLS) מלא ב־Supabase
- RTL בעברית

---

## 📁 מבנה תיקיות

```
fashion-store/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # דף בית
│   │   ├── layout.tsx                  # Root layout
│   │   ├── globals.css
│   │   ├── products/page.tsx           # קטלוג
│   │   ├── product/[id]/               # עמוד מוצר בודד
│   │   ├── cart/page.tsx               # סל
│   │   ├── checkout/                   # קופה + success
│   │   ├── login/ · register/          # אימות
│   │   ├── admin/                      # פאנל ניהול
│   │   │   ├── layout.tsx              # בדיקת role=admin
│   │   │   ├── page.tsx                # Dashboard
│   │   │   ├── products/               # CRUD מוצרים
│   │   │   ├── orders/                 # ניהול הזמנות
│   │   │   └── customers/              # לקוחות
│   │   └── api/
│   │       ├── products/ · orders/ · chat/
│   ├── components/
│   │   ├── Navbar.tsx · Footer.tsx
│   │   ├── ProductCard.tsx · CartItem.tsx
│   │   ├── ChatWidget.tsx              # AI Assistant
│   │   └── ui/                         # Button/Input/Card/Badge/…
│   ├── lib/
│   │   ├── supabase/{client,server,admin,middleware}.ts
│   │   ├── auth.ts · utils.ts · validators.ts (zod)
│   ├── store/cart.ts                   # Zustand
│   ├── types/{product,order,user}.ts
│   └── middleware.ts                   # Supabase session refresh
└── supabase/schema.sql                 # סכמת DB + RLS + seed
```

---

## 🚀 הפעלה (Setup מהיר)

### 1) התקנה

**דרך A — סקריפט אוטומטי (מומלץ):**

Windows PowerShell:
```powershell
cd fashion-store
.\install.ps1
```

Linux / macOS:
```bash
cd fashion-store
chmod +x install.sh && ./install.sh
```

**דרך B — ידני:**
```bash
cd fashion-store
npm install
```

📋 רשימה קריאה של כל הספריות: ראה [`requirements.txt`](./requirements.txt)

### 2) יצירת פרויקט Supabase

1. היכנס ל־<https://supabase.com/dashboard> וצור פרויקט חדש בשם `FashionStore`.
2. אחרי שהפרויקט מוכן, לך ל־**Settings → API** והעתק:
   - `Project URL`
   - `anon` key (public)
   - `service_role` key (secret! לשרת בלבד)

### 3) יצירת `.env.local`

צור בשורש `fashion-store/` את הקובץ:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

# אופציונלי - AI Assistant:
OPENAI_API_KEY=sk-...

# אופציונלי - Stripe (סליקה מאובטחת):
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_CURRENCY=ils

# אופציונלי - Resend (מיילי אישור הזמנה):
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=FashionStore <onboarding@resend.dev>
```

> אין `OPENAI_API_KEY`? ה־AI ייפול חזרה ל־fallback מקומי (המלצות פשוטות מבוססות מילות מפתח).
> אין `STRIPE_SECRET_KEY`? כל שאר אמצעי התשלום עדיין יעבדו — Stripe פשוט לא יופיע.
> אין `RESEND_API_KEY`? הזמנות יעבדו — פשוט לא יישלחו מיילי אישור.

### 4) הרצת סכמת ה־DB

1. פתח ב־Supabase Dashboard את **SQL Editor**.
2. הדבק את התוכן של [`supabase/schema.sql`](./supabase/schema.sql) ולחץ **Run**.
3. אם כבר יש לך פרויקט קיים, הרץ בנוסף את [`supabase/add-variants-and-gallery.sql`](./supabase/add-variants-and-gallery.sql) לתוספת השדות החדשים (מידות, צבעים, גלריית תמונות, Stripe).

הסכמה יוצרת:

- 4 טבלאות: `products` (עם `images[]`, `sizes[]`, `colors[]`), `profiles`, `orders` (עם `stripe_session_id`), `order_items` (עם `size`, `color`)
- Bucket `products` (public) ב־Supabase Storage
- מדיניות RLS מלאה
- Trigger שיוצר `profile` אוטומטית לכל משתמש חדש
- **8 מוצרי דמו** להתחלה מהירה 🎁

### 5) הפיכת משתמש לאדמין

1. הרץ `npm run dev` והיכנס ל־`/register`.
2. הירשם עם המייל שלך.
3. ב־Supabase Dashboard → **SQL Editor** הרץ:

   ```sql
   update public.profiles set role='admin' where email = 'your@email.com';
   ```

4. התחבר מחדש — ה־Navbar יציג כפתור **Admin** ותוכל להיכנס ל־`/admin`.

### 6) הרצה

```bash
npm run dev
```

לך ל־<http://localhost:3000> 🎉

---

## 🧭 מסלולי המערכת

| מסלול | תיאור |
|-------|-------|
| `/` | דף בית |
| `/products` | קטלוג עם סינון + חיפוש (`?category=Men&q=hoodie`) |
| `/product/[id]` | עמוד מוצר בודד + גלריית תמונות + בחירת מידה/צבע |
| `/cart` | סל קניות |
| `/checkout` | קופה עם 6 אמצעי תשלום |
| `/checkout/success?order=…` | דף אישור |
| `/account` | 👤 החשבון שלי + היסטוריית הזמנות |
| `/login` · `/register` | אימות |
| `/forgot-password` | 🔑 שכחתי סיסמה |
| `/reset-password` | איפוס סיסמה (מהלינק במייל) |
| `/admin` | Dashboard (אדמין בלבד) |
| `/admin/products` | ניהול מוצרים |
| `/admin/products/new` | הוספת מוצר + מידות + צבעים + גלריה |
| `/admin/products/[id]` | עריכת מוצר |
| `/admin/orders` | ניהול הזמנות + עדכון סטטוס (שולח מייל אוטומטית) |
| `/admin/customers` | רשימת לקוחות |

### API

| שיטה + מסלול | תיאור |
|-------|-------|
| `GET  /api/products?category=&q=` | רשימת מוצרים (חיפוש בשם/תיאור/קטגוריה) |
| `POST /api/products` | יצירת מוצר (admin) |
| `PUT/DELETE /api/products/[id]` | עדכון/מחיקת מוצר (admin) |
| `POST /api/orders` | יצירת הזמנה חדשה + שליחת מייל אישור |
| `PATCH /api/orders/[id]` | עדכון סטטוס הזמנה (admin) + מייל עדכון |
| `POST /api/checkout/stripe` | יצירת Stripe Checkout Session |
| `POST /api/stripe/webhook` | Webhook של Stripe (checkout.session.completed) |
| `POST /api/chat` | AI Style Assistant |

---

## 💳 Stripe — הגדרת סליקה

1. הירשם ב-<https://dashboard.stripe.com/register> (חינם, ללא דמי הפעלה)
2. עבור ל-**Developers → API keys** והעתק:
   - `Secret key` → `STRIPE_SECRET_KEY`
   - `Publishable key` → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
3. הגדר Webhook: **Developers → Webhooks → Add endpoint**:
   - URL: `https://your-domain.vercel.app/api/stripe/webhook`
   - Events: `checkout.session.completed`, `checkout.session.expired`, `checkout.session.async_payment_failed`
   - העתק את ה-`Signing secret` → `STRIPE_WEBHOOK_SECRET`
4. לפיתוח מקומי — התקן את ה-CLI של Stripe: `stripe listen --forward-to localhost:3000/api/stripe/webhook`

בדף ה-checkout בחר **"Stripe (מאובטח)"** — הלקוח יופנה לעמוד תשלום של Stripe.

**כרטיסי בדיקה:** `4242 4242 4242 4242` · תאריך עתידי · CVC כלשהו

---

## 📧 Resend — מיילי אישור הזמנה

1. הירשם ב-<https://resend.com> (100 מיילים ליום חינם)
2. **API Keys → Create** → העתק את המפתח ל-`RESEND_API_KEY`
3. לבדיקות אפשר להשתמש ב-`onboarding@resend.dev` (מוגבל לשליחה לעצמך)
4. לפרודקשן — הוסף דומיין ב-**Domains** ואמת אותו (SPF/DKIM) → עדכן `RESEND_FROM_EMAIL`

מיילים שנשלחים אוטומטית:
- **אישור הזמנה** — כשלקוח מזמין (או לאחר תשלום מוצלח ב-Stripe)
- **עדכון סטטוס** — כשהאדמין משנה סטטוס (paid → shipped → delivered)

---

## 🎨 סטק טכנולוגי

**Frontend**
- Next.js 15 (App Router, RSC)
- TypeScript
- Tailwind CSS + רכיבי UI בסגנון Shadcn
- Zustand (state לסל, עם persist)
- lucide-react (איקונים)
- sonner (toasts)
- zod (ולידציה)

**Backend / Data**
- Next.js API Routes
- Supabase (PostgreSQL + Auth + Storage)
- `@supabase/ssr` לניהול session ב־App Router
- RLS Policies מלאות
- Service Role Key (רק בשרת) עבור פעולות עוקפות־RLS מבוקרות

**AI**
- OpenAI Chat Completions (`gpt-4o-mini`) — אופציונלי
- Fallback מקומי במקרה של חוסר מפתח

---

## 🌐 Deployment ל־Vercel

1. Push לגיטהאב:

   ```bash
   git init && git add . && git commit -m "initial ecommerce"
   git remote add origin git@github.com:you/fashion-store.git
   git push -u origin main
   ```

2. ב־<https://vercel.com/new> — Import Repository.
3. הגדר את משתני הסביבה מ־`.env.local` בהגדרות הפרויקט ב־Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `OPENAI_API_KEY` (אופציונלי)
4. Deploy.

---

## 🔒 אבטחה

- כל טבלה מוגנת ב־**Row Level Security**:
  - Products: קריאה חופשית, כתיבה רק לאדמינים.
  - Profiles: משתמש רואה רק את עצמו (אדמין רואה הכל).
  - Orders: משתמש רואה רק את ההזמנות שלו.
  - Storage: קריאה חופשית מ־bucket `products`, העלאה רק לאדמין.
- Service Role Key **לעולם לא נחשף לקליינט** — משמש רק ב־Route Handlers.
- `middleware.ts` מרענן session אוטומטית בכל בקשה.

---

## 🛣️ Roadmap עתידי

- [ ] סליקה אמיתית (Stripe Checkout + Webhook)
- [ ] מייל אישור הזמנה (Resend)
- [ ] דירוגים וביקורות של מוצרים
- [ ] Wishlist
- [ ] חיפוש מלא (Full Text Search)
- [ ] Dark mode toggle
- [ ] Multi-language (i18n)

---

## 🤝 עבודה עם Cursor

הפרויקט הזה נבנה במיוחד ככה שקל להרחיב אותו עם Cursor. דוגמאות לפרומפטים טובים:

```
Add a wishlist feature.

Requirements:
- Zustand store similar to src/store/cart.ts
- New route /wishlist
- Heart button on ProductCard
- Persist to localStorage
```

```
Add Stripe checkout.

- Replace mock payment on /checkout with Stripe Elements
- Add /api/stripe/webhook
- On payment_intent.succeeded → set order status='paid'
- Follow the same auth patterns as src/app/api/orders/route.ts
```

בהצלחה! 🚀
