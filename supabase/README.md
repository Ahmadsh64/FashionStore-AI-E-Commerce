# Supabase — קובץ אחד

הרץ **רק** את [`schema.sql`](./schema.sql) ב-SQL Editor.

הוא מאחד את כל המיגרציות הישנות (תשלום, Stripe, וריאציות, RLS, ביקורות, קופונים, בלוג).

אפשר להריץ אותו שוב — הוא לא מוחק נתונים ולא משכפל מוצרים.

אם מופיע `PGRST200` על `orders` / `order_items`, הרץ גם [`fix-order-items-fk.sql`](./fix-order-items-fk.sql).
