-- ============================================
-- FIX: RLS Infinite Recursion on profiles
-- ============================================
-- הבעיה: ה-policy על טבלת profiles הכילה sub-select
-- על profiles עצמה → recursion → 500 Internal Server Error.
--
-- הפתרון: פונקציה security definer שעוקפת RLS
-- בבדיקת role, כך שאין recursion.
--
-- הרץ קובץ זה ב-Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql
-- ============================================

-- 1) פונקציית עזר שעוקפת RLS
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


-- 2) profiles - תיקון הרקורסיה
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (
    auth.uid() = id or public.is_admin()
  );


-- 3) products - החלפת sub-select ב-is_admin()
drop policy if exists "products_admin_write" on public.products;
create policy "products_admin_write" on public.products
  for all
  using (public.is_admin())
  with check (public.is_admin());


-- 4) orders
drop policy if exists "orders_select_own" on public.orders;
create policy "orders_select_own" on public.orders
  for select using (
    auth.uid() = user_id or public.is_admin()
  );

drop policy if exists "orders_admin_update" on public.orders;
create policy "orders_admin_update" on public.orders
  for update using (public.is_admin());


-- 5) order_items
drop policy if exists "order_items_select" on public.order_items;
create policy "order_items_select" on public.order_items
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and (o.user_id = auth.uid() or public.is_admin())
    )
  );


-- 6) storage - העלאת תמונות למוצרים
drop policy if exists "products_bucket_admin_write" on storage.objects;
create policy "products_bucket_admin_write" on storage.objects
  for insert with check (
    bucket_id = 'products' and public.is_admin()
  );

-- ============================================
-- ✅ בוצע! עכשיו הבקשה על /profiles תעבוד.
-- ============================================
