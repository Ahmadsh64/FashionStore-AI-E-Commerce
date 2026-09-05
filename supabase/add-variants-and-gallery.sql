-- ============================================
-- Migration: וריאציות (מידה/צבע) + גלריית תמונות + Stripe
-- ============================================
-- הרץ קובץ זה ב-Supabase SQL Editor
-- https://supabase.com/dashboard/project/_/sql
-- ============================================

-- 1) הוספת גלריית תמונות למוצר (בנוסף ל-image_url הראשי)
alter table public.products
  add column if not exists images text[] not null default '{}';

-- 2) וריאציות מוצר - מידות וצבעים
alter table public.products
  add column if not exists sizes  text[] not null default '{}',
  add column if not exists colors text[] not null default '{}';

-- 3) שמירת הבחירה של הלקוח בפריטי ההזמנה
alter table public.order_items
  add column if not exists size  text,
  add column if not exists color text;

-- 4) Stripe integration - שמירת session ID + payment intent
alter table public.orders
  add column if not exists stripe_session_id text,
  add column if not exists stripe_payment_intent text;

-- אינדקס לחיפוש מהיר לפי Stripe session (webhook)
create index if not exists idx_orders_stripe_session
  on public.orders(stripe_session_id);

-- 5) עדכון מוצרי הדמו הקיימים עם וריאציות (אם קיימים)
update public.products
set
  sizes = case
    when category in ('Men','Women') then array['S','M','L','XL']
    when category = 'Kids' then array['4','6','8','10','12']
    when category = 'Shoes' then array['38','39','40','41','42','43','44']
    else '{}'::text[]
  end,
  colors = case
    when category = 'Men'   then array['Black','White','Navy']
    when category = 'Women' then array['Black','White','Rose','Beige']
    when category = 'Kids'  then array['Blue','Pink','Yellow']
    when category = 'Shoes' then array['Black','White','Brown']
    else '{}'::text[]
  end
where cardinality(sizes) = 0
   or cardinality(colors) = 0;

-- ✅ בוצע
