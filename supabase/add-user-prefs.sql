-- סל / מועדפים / נצפו לאחרונה לפי חשבון
-- אפשר להריץ את זה בלבד, או את schema.sql כולו (גם הוא מעדכן את זה).

create table if not exists public.user_prefs (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  cart       jsonb not null default '[]'::jsonb,
  wishlist   jsonb not null default '[]'::jsonb,
  recent     jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_prefs enable row level security;

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
