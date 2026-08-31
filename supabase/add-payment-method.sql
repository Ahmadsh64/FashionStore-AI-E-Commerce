-- ============================================
-- Migration: הוספת עמודת payment_method לטבלת orders
-- ============================================
-- הרץ קובץ זה ב-Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql
-- ============================================

alter table public.orders
  add column if not exists payment_method text
  check (payment_method in (
    'credit_card',
    'bit',
    'paypal',
    'paybox',
    'cash_on_delivery',
    'bank_transfer'
  ));

-- לוודא שזה הוסף:
-- select id, payment_method from public.orders limit 5;
