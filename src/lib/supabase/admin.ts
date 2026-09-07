import { createClient } from "@supabase/supabase-js";
import { getSupabaseUrl } from "@/lib/supabase/url";

/**
 * קליינט Admin עם Service Role - עוקף RLS.
 * להשתמש רק ב-Route Handlers / Server Actions מאובטחים!
 */
export function createAdminClient() {
  return createClient(
    getSupabaseUrl(),
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}
