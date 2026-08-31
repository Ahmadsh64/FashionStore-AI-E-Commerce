-- ============================================
-- FashionStore - Supabase Database Schema
-- ============================================
-- הרץ את הקובץ הזה ב-Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql
-- ============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- 1) PRODUCTS TABLE
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

create index if not exists idx_products_category on public.products(category);
create index if not exists idx_products_created_at on public.products(created_at desc);

-- ============================================
-- 2) PROFILES TABLE (extends auth.users)
-- ============================================
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  name       text default '',
  email      text not null,
  role       text not null default 'customer' check (role in ('customer','admin')),
  created_at timestamptz not null default now()
);

-- Trigger: יצירת profile אוטומטית ברישום משתמש חדש
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name', ''));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================
-- 3) ORDERS TABLE
-- ============================================
create table if not exists public.orders (
  id             uuid primary key default uuid_generate_v4(),
  user_id        uuid references auth.users(id) on delete set null,
  full_name      text not null default '',
  email          text not null default '',
  phone          text not null default '',
  address        text not null default '',
  total          numeric(10,2) not null default 0,
  status         text not null default 'pending' check (status in ('pending','paid','shipped','delivered','cancelled')),
  payment_method text check (payment_method in ('credit_card','bit','paypal','paybox','cash_on_delivery','bank_transfer')),
  created_at     timestamptz not null default now()
);

create index if not exists idx_orders_user on public.orders(user_id);
create index if not exists idx_orders_created_at on public.orders(created_at desc);

-- ============================================
-- 4) ORDER ITEMS
-- ============================================
create table if not exists public.order_items (
  id          uuid primary key default uuid_generate_v4(),
  order_id    uuid not null references public.orders(id) on delete cascade,
  product_id  uuid references public.products(id) on delete set null,
  name        text not null,
  quantity    integer not null check (quantity > 0),
  price       numeric(10,2) not null check (price >= 0)
);

create index if not exists idx_order_items_order on public.order_items(order_id);

-- ============================================
-- 5) STORAGE BUCKET (רץ ידנית ב-Supabase Dashboard או דרך SQL כאן)
-- ============================================
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do nothing;

-- ============================================
-- 6) HELPER FUNCTION (עוקפת RLS למניעת recursion)
-- ============================================
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
-- 7) ROW LEVEL SECURITY (RLS)
-- ============================================
alter table public.products    enable row level security;
alter table public.profiles    enable row level security;
alter table public.orders      enable row level security;
alter table public.order_items enable row level security;

-- Products: כולם קוראים, רק אדמין כותב
drop policy if exists "products_select_all" on public.products;
create policy "products_select_all" on public.products
  for select using (true);

drop policy if exists "products_admin_write" on public.products;
create policy "products_admin_write" on public.products
  for all
  using (public.is_admin())
  with check (public.is_admin());

-- Profiles: משתמש רואה את שלו, אדמין רואה הכל
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (
    auth.uid() = id or public.is_admin()
  );

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- Orders: משתמש רואה את שלו, אדמין רואה הכל
drop policy if exists "orders_select_own" on public.orders;
create policy "orders_select_own" on public.orders
  for select using (
    auth.uid() = user_id or public.is_admin()
  );

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

-- Storage: קריאה פומבית, כתיבה לאדמין
drop policy if exists "products_bucket_read" on storage.objects;
create policy "products_bucket_read" on storage.objects
  for select using (bucket_id = 'products');

drop policy if exists "products_bucket_admin_write" on storage.objects;
create policy "products_bucket_admin_write" on storage.objects
  for insert with check (
    bucket_id = 'products' and public.is_admin()
  );

-- ============================================
-- 8) SEED DATA (דמו - אופציונלי)
-- ============================================
insert into public.products (name, description, price, category, image_url, stock) values
  ('Nike Air Hoodie',       'Comfortable oversized hoodie perfect for winter days.',        250, 'Men',    'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800', 20),
  ('Linen Summer Shirt',    'Breathable linen shirt, ideal for hot summer days.',           180, 'Men',    'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800', 15),
  ('Vintage Denim Jacket',  'Classic denim jacket with a modern twist.',                    320, 'Women',  'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800', 12),
  ('Floral Midi Dress',     'Elegant floral dress perfect for spring occasions.',           220, 'Women',  'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800', 18),
  ('Kids Rainbow T-Shirt',  'Fun colorful t-shirt for children aged 4-10.',                  80, 'Kids',   'https://images.unsplash.com/photo-1522771930-78848d9293e8?w=800', 30),
  ('Leather Sneakers',      'Premium leather sneakers with cushioned soles.',               450, 'Shoes',  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800', 25),
  ('Wool Winter Coat',      'Warm wool coat with modern minimalist design.',                690, 'Women',  'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=800', 8),
  ('Classic White Sneakers','Timeless white sneakers, goes with everything.',               290, 'Shoes',  'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800', 40)
on conflict do nothing;

-- ============================================
-- הפוך משתמש לאדמין (הרץ אחרי שנרשמת):
-- update public.profiles set role='admin' where email = 'your@email.com';
-- ============================================
