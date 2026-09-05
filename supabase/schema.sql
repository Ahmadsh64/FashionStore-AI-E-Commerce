-- ============================================
-- FashionStore — סכמה מאוחדת (idempotent)
-- ============================================
-- הרץ את הקובץ הזה פעם אחת ב-Supabase SQL Editor.
-- בטוח גם על פרויקט חדש וגם על פרויקט קיים:
-- לא מוחק נתונים, מוסיף רק מה שחסר, מעדכן מדיניות.
-- https://supabase.com/dashboard/project/_/sql
-- ============================================

create extension if not exists "uuid-ossp";

-- ============================================
-- 1) טבלאות בסיס
-- ============================================
create table if not exists public.products (
  id            uuid primary key default uuid_generate_v4(),
  name          text not null,
  description   text default '',
  price         numeric(10,2) not null check (price >= 0),
  category      text not null default 'Other',
  image_url     text default '',
  stock         integer not null default 0 check (stock >= 0),
  created_at    timestamptz not null default now()
);

create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  name       text default '',
  email      text not null,
  role       text not null default 'customer' check (role in ('customer','admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references auth.users(id) on delete set null,
  full_name   text not null default '',
  email       text not null default '',
  phone       text not null default '',
  address     text not null default '',
  total       numeric(10,2) not null default 0,
  status      text not null default 'pending',
  created_at  timestamptz not null default now()
);

create table if not exists public.order_items (
  id          uuid primary key default uuid_generate_v4(),
  order_id    uuid not null references public.orders(id) on delete cascade,
  product_id  uuid references public.products(id) on delete set null,
  name        text not null,
  quantity    integer not null check (quantity > 0),
  price       numeric(10,2) not null check (price >= 0)
);

-- ============================================
-- 2) עמודות שנוספו בהמשך (בטוח אם כבר קיימות)
-- ============================================
alter table public.products
  add column if not exists images    text[] not null default '{}',
  add column if not exists sizes     text[] not null default '{}',
  add column if not exists colors    text[] not null default '{}',
  add column if not exists brand     text not null default '';

alter table public.order_items
  add column if not exists size  text,
  add column if not exists color text;

alter table public.orders
  add column if not exists payment_method        text,
  add column if not exists stripe_session_id     text,
  add column if not exists stripe_payment_intent text,
  add column if not exists coupon_code           text,
  add column if not exists discount              numeric(10,2) not null default 0;

-- אילוץ סטטוס + אמצעי תשלום (מוחקים ישן אם קיים, כדי לכלול stripe)
do $$
declare r record;
begin
  for r in
    select c.conname
    from pg_constraint c
    where c.conrelid = 'public.orders'::regclass
      and c.contype = 'c'
      and (
        pg_get_constraintdef(c.oid) ilike '%payment_method%'
        or pg_get_constraintdef(c.oid) ilike '%status%'
      )
  loop
    execute format('alter table public.orders drop constraint if exists %I', r.conname);
  end loop;
end $$;

alter table public.orders
  add constraint orders_status_check
  check (status in ('pending','paid','shipped','delivered','cancelled'));

alter table public.orders
  add constraint orders_payment_method_check
  check (
    payment_method is null
    or payment_method in (
      'credit_card','bit','paypal','paybox',
      'cash_on_delivery','bank_transfer','stripe'
    )
  );

-- ============================================
-- 3) טבלאות פיצ'רים
-- ============================================
create table if not exists public.reviews (
  id          uuid primary key default uuid_generate_v4(),
  product_id  uuid not null references public.products(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  author_name text not null default '',
  rating      integer not null check (rating between 1 and 5),
  comment     text not null default '',
  created_at  timestamptz not null default now(),
  unique (product_id, user_id)
);

create table if not exists public.coupons (
  id          uuid primary key default uuid_generate_v4(),
  code        text not null unique,
  type        text not null check (type in ('percent','fixed')),
  value       numeric(10,2) not null check (value > 0),
  min_order   numeric(10,2) not null default 0,
  max_uses    integer,
  used_count  integer not null default 0,
  active      boolean not null default true,
  expires_at  timestamptz,
  created_at  timestamptz not null default now()
);

create table if not exists public.newsletter (
  id          uuid primary key default uuid_generate_v4(),
  email       text not null unique,
  created_at  timestamptz not null default now()
);

create table if not exists public.posts (
  id          uuid primary key default uuid_generate_v4(),
  slug        text not null unique,
  title       text not null,
  excerpt     text not null default '',
  content     text not null default '',
  image_url   text not null default '',
  published   boolean not null default true,
  created_at  timestamptz not null default now()
);

create table if not exists public.contact_messages (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  email       text not null,
  message     text not null,
  created_at  timestamptz not null default now()
);

create table if not exists public.abandoned_carts (
  id           uuid primary key default uuid_generate_v4(),
  email        text not null unique,
  full_name    text not null default '',
  items        jsonb not null default '[]',
  total        numeric(10,2) not null default 0,
  recovered    boolean not null default false,
  emailed_at   timestamptz,
  updated_at   timestamptz not null default now()
);

create table if not exists public.marketing_sends (
  id         uuid primary key default uuid_generate_v4(),
  email      text not null,
  kind       text not null check (kind in ('abandoned','winback')),
  sent_at    timestamptz not null default now()
);

-- סל / מועדפים / נצפו לאחרונה — לכל חשבון בנפרד
create table if not exists public.user_prefs (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  cart       jsonb not null default '[]'::jsonb,
  wishlist   jsonb not null default '[]'::jsonb,
  recent     jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

-- ============================================
-- 4) אינדקסים
-- ============================================
create index if not exists idx_products_category    on public.products(category);
create index if not exists idx_products_created_at  on public.products(created_at desc);
create index if not exists idx_products_brand       on public.products(brand);
create index if not exists idx_orders_user          on public.orders(user_id);
create index if not exists idx_orders_created_at    on public.orders(created_at desc);
create index if not exists idx_orders_stripe_session on public.orders(stripe_session_id);
create index if not exists idx_order_items_order    on public.order_items(order_id);
create index if not exists idx_reviews_product      on public.reviews(product_id);
create index if not exists idx_reviews_created      on public.reviews(created_at desc);
create index if not exists idx_coupons_code         on public.coupons(code);
create index if not exists idx_marketing_sends_email_kind
  on public.marketing_sends(email, kind, sent_at desc);

-- ============================================
-- 5) פונקציות + טריגרים
-- ============================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- עוקפת RLS — מונעת recursion ב-profiles
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists(
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

grant execute on function public.is_admin() to anon, authenticated;

-- ============================================
-- 6) Storage
-- ============================================
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do nothing;

-- ============================================
-- 7) RLS
-- ============================================
alter table public.products          enable row level security;
alter table public.profiles          enable row level security;
alter table public.orders            enable row level security;
alter table public.order_items       enable row level security;
alter table public.reviews           enable row level security;
alter table public.coupons           enable row level security;
alter table public.newsletter        enable row level security;
alter table public.posts             enable row level security;
alter table public.contact_messages  enable row level security;
alter table public.abandoned_carts   enable row level security;
alter table public.marketing_sends   enable row level security;
alter table public.user_prefs        enable row level security;

-- Products
drop policy if exists "products_select_all" on public.products;
create policy "products_select_all" on public.products
  for select using (true);

drop policy if exists "products_admin_write" on public.products;
create policy "products_admin_write" on public.products
  for all using (public.is_admin()) with check (public.is_admin());

-- Profiles (בלי sub-select על profiles)
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id or public.is_admin());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- Orders
drop policy if exists "orders_select_own" on public.orders;
create policy "orders_select_own" on public.orders
  for select using (auth.uid() = user_id or public.is_admin() or email = auth.jwt()->>'email');

drop policy if exists "orders_insert_any" on public.orders;
create policy "orders_insert_any" on public.orders
  for insert with check (true);

drop policy if exists "orders_admin_update" on public.orders;
create policy "orders_admin_update" on public.orders
  for update using (public.is_admin());

-- Order items
drop policy if exists "order_items_select" on public.order_items;
create policy "order_items_select" on public.order_items
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and (o.user_id = auth.uid() or public.is_admin())
    )
  );

drop policy if exists "order_items_insert" on public.order_items;
create policy "order_items_insert" on public.order_items
  for insert with check (true);

-- Reviews
drop policy if exists "reviews_select_all" on public.reviews;
create policy "reviews_select_all" on public.reviews
  for select using (true);

drop policy if exists "reviews_insert_own" on public.reviews;
create policy "reviews_insert_own" on public.reviews
  for insert with check (auth.uid() = user_id);

drop policy if exists "reviews_update_own" on public.reviews;
create policy "reviews_update_own" on public.reviews
  for update using (auth.uid() = user_id or public.is_admin());

drop policy if exists "reviews_delete_own" on public.reviews;
create policy "reviews_delete_own" on public.reviews
  for delete using (auth.uid() = user_id or public.is_admin());

-- Coupons
drop policy if exists "coupons_select_active" on public.coupons;
create policy "coupons_select_active" on public.coupons
  for select using (active = true or public.is_admin());

drop policy if exists "coupons_admin_write" on public.coupons;
create policy "coupons_admin_write" on public.coupons
  for all using (public.is_admin()) with check (public.is_admin());

-- Newsletter
drop policy if exists "newsletter_insert" on public.newsletter;
create policy "newsletter_insert" on public.newsletter
  for insert with check (true);

drop policy if exists "newsletter_admin" on public.newsletter;
create policy "newsletter_admin" on public.newsletter
  for select using (public.is_admin());

-- Posts
drop policy if exists "posts_select_pub" on public.posts;
create policy "posts_select_pub" on public.posts
  for select using (published = true or public.is_admin());

drop policy if exists "posts_admin_write" on public.posts;
create policy "posts_admin_write" on public.posts
  for all using (public.is_admin()) with check (public.is_admin());

-- Contact
drop policy if exists "contact_insert" on public.contact_messages;
create policy "contact_insert" on public.contact_messages
  for insert with check (true);

drop policy if exists "contact_admin" on public.contact_messages;
create policy "contact_admin" on public.contact_messages
  for select using (public.is_admin());

-- Abandoned carts / marketing (service role עוקף RLS; אדמין רואה)
drop policy if exists "abandoned_admin" on public.abandoned_carts;
create policy "abandoned_admin" on public.abandoned_carts
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "marketing_admin" on public.marketing_sends;
create policy "marketing_admin" on public.marketing_sends
  for all using (public.is_admin()) with check (public.is_admin());

-- העדפות חשבון: כל משתמש רואה ומעדכן רק את השורה שלו
drop policy if exists "user_prefs_select_own" on public.user_prefs;
create policy "user_prefs_select_own" on public.user_prefs
  for select using (auth.uid() = user_id);

drop policy if exists "user_prefs_insert_own" on public.user_prefs;
create policy "user_prefs_insert_own" on public.user_prefs
  for insert with check (auth.uid() = user_id);

drop policy if exists "user_prefs_update_own" on public.user_prefs;
create policy "user_prefs_update_own" on public.user_prefs
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

grant select, insert, update on public.user_prefs to authenticated;

-- Storage
drop policy if exists "products_bucket_read" on storage.objects;
create policy "products_bucket_read" on storage.objects
  for select using (bucket_id = 'products');

drop policy if exists "products_bucket_admin_write" on storage.objects;
create policy "products_bucket_admin_write" on storage.objects
  for insert with check (bucket_id = 'products' and public.is_admin());

drop policy if exists "products_bucket_admin_update" on storage.objects;
create policy "products_bucket_admin_update" on storage.objects
  for update using (bucket_id = 'products' and public.is_admin());

drop policy if exists "products_bucket_admin_delete" on storage.objects;
create policy "products_bucket_admin_delete" on storage.objects
  for delete using (bucket_id = 'products' and public.is_admin());

-- ============================================
-- 8) Seed — רק אם חסר (לא משכפל)
-- ============================================
insert into public.products (name, description, price, category, image_url, stock, sizes, colors, brand)
select v.name, v.description, v.price, v.category, v.image_url, v.stock, v.sizes, v.colors, v.brand
from (
  values
    ('Nike Air Hoodie', 'Comfortable oversized hoodie perfect for winter days.', 250::numeric, 'Men',
     'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800', 20,
     array['S','M','L','XL']::text[], array['Black','White','Navy']::text[], 'Nike'),
    ('Linen Summer Shirt', 'Breathable linen shirt, ideal for hot summer days.', 180, 'Men',
     'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800', 15,
     array['S','M','L','XL']::text[], array['Black','White','Navy']::text[], ''),
    ('Vintage Denim Jacket', 'Classic denim jacket with a modern twist.', 320, 'Women',
     'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800', 12,
     array['XS','S','M','L','XL']::text[], array['Black','White','Rose','Beige']::text[], ''),
    ('Floral Midi Dress', 'Elegant floral dress perfect for spring occasions.', 220, 'Women',
     'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800', 18,
     array['XS','S','M','L','XL']::text[], array['Black','White','Rose','Beige']::text[], ''),
    ('Kids Rainbow T-Shirt', 'Fun colorful t-shirt for children aged 4-10.', 80, 'Kids',
     'https://images.unsplash.com/photo-1522771930-78848d9293e8?w=800', 30,
     array['4','6','8','10','12']::text[], array['Blue','Pink','Yellow']::text[], ''),
    ('Leather Sneakers', 'Premium leather sneakers with cushioned soles.', 450, 'Shoes',
     'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800', 25,
     array['38','39','40','41','42','43','44']::text[], array['Black','White','Brown']::text[], ''),
    ('Wool Winter Coat', 'Warm wool coat with modern minimalist design.', 690, 'Women',
     'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=800', 8,
     array['XS','S','M','L','XL']::text[], array['Black','White','Beige']::text[], ''),
    ('Classic White Sneakers', 'Timeless white sneakers, goes with everything.', 290, 'Shoes',
     'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800', 40,
     array['38','39','40','41','42','43','44']::text[], array['White','Black']::text[], '')
) as v(name, description, price, category, image_url, stock, sizes, colors, brand)
where not exists (select 1 from public.products p where p.name = v.name);

update public.products
set
  sizes = case
    when category in ('Men','Women') then array['S','M','L','XL']
    when category = 'Kids' then array['4','6','8','10','12']
    when category = 'Shoes' then array['38','39','40','41','42','43','44']
    else sizes
  end,
  colors = case
    when category = 'Men'   then array['Black','White','Navy']
    when category = 'Women' then array['Black','White','Rose','Beige']
    when category = 'Kids'  then array['Blue','Pink','Yellow']
    when category = 'Shoes' then array['Black','White','Brown']
    else colors
  end
where cardinality(coalesce(sizes, '{}')) = 0
   or cardinality(coalesce(colors, '{}')) = 0;

insert into public.coupons (code, type, value, min_order, max_uses, active)
values
  ('WELCOME10', 'percent', 10, 0, 1000, true),
  ('SUMMER50', 'fixed', 50, 200, 200, true)
on conflict (code) do nothing;

insert into public.posts (slug, title, excerpt, content, image_url, published)
values
  (
    'madrikh-kayits-2026',
    'מדריך סגנון לקיץ 2026',
    'איך לבנות ארון קיץ קליל שלא נראה כמו כולם.',
    E'הקיץ הזה מדבר פשתן, כותנה וצבעים בהירים.\n\nהתחילו מחולצה לבנה טובה ומכנסיים רחבים.',
    'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1200',
    true
  ),
  (
    'eikh-livhor-midah',
    'איך לבחור מידה אונליין בלי להחזיר',
    'טבלת מידות, בד וגזרה — מה באמת חשוב.',
    E'מדדו חזה, מותן וירך עם סרט מדידה. השוו לטבלה של המוצר.',
    'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=1200',
    true
  ),
  (
    'kapsula-wardrob',
    'ארון קפסולה ישראלי: 12 פריטים',
    'פחות בגדים, יותר שילובים — גם לימי חול וגם לערב.',
    E'הבסיס: ג''ינס כהה, מכנסיים שחורים, חולצה לבנה, סניקרס, ופריט אחד שמח.',
    'https://images.unsplash.com/photo-1489987707025-901f5e8bed6b?w=1200',
    true
  )
on conflict (slug) do nothing;

-- ============================================
-- הפוך משתמש לאדמין (הרץ אחרי הרשמה, עם האימייל שלך):
-- update public.profiles set role = 'admin' where email = 'your@email.com';
-- ============================================
