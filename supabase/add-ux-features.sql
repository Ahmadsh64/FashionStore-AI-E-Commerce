-- ============================================
-- Migration: Wishlist-ready brand + Reviews
-- ============================================
-- הרץ ב-Supabase SQL Editor
-- https://supabase.com/dashboard/project/_/sql
-- ============================================

-- 1) מותג למוצר (סינון מתקדם)
alter table public.products
  add column if not exists brand text not null default '';

create index if not exists idx_products_brand on public.products(brand);

-- 2) ביקורות ודירוגים
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

create index if not exists idx_reviews_product on public.reviews(product_id);
create index if not exists idx_reviews_created on public.reviews(created_at desc);

alter table public.reviews enable row level security;

drop policy if exists "reviews_select_all" on public.reviews;
create policy "reviews_select_all" on public.reviews
  for select using (true);

drop policy if exists "reviews_insert_own" on public.reviews;
create policy "reviews_insert_own" on public.reviews
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "reviews_update_own" on public.reviews;
create policy "reviews_update_own" on public.reviews
  for update
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "reviews_delete_own" on public.reviews;
create policy "reviews_delete_own" on public.reviews
  for delete
  using (auth.uid() = user_id or public.is_admin());

-- ✅ בוצע
