import { createClient } from "@supabase/supabase-js";

/**
 * קליינט Admin עם Service Role - עוקף RLS.
 * להשתמש רק ב-Route Handlers / Server Actions מאובטחים!
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}
