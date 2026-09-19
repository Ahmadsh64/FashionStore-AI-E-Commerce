-- PostgREST embeds (orders → order_items) require a real FK.
-- CREATE TABLE IF NOT EXISTS will NOT add this if the table already existed without it.
-- Run once in Supabase SQL Editor, then (optional) reload schema cache.

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.order_items'::regclass
      and contype = 'f'
      and confrelid = 'public.orders'::regclass
  ) then
    alter table public.order_items
      add constraint order_items_order_id_fkey
      foreign key (order_id)
      references public.orders(id)
      on delete cascade;
  end if;
end $$;

notify pgrst, 'reload schema';
