import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/url";

type CookieToSet = { name: string; value: string; options?: CookieOptions };

/**
 * קליינט Supabase לרכיבי Server Components / API Routes.
 * משתמש ב-cookies כדי לזהות משתמש מחובר.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    getSupabaseUrl(),
    getSupabaseAnonKey(),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // ב-Server Components לא ניתן לכתוב cookies - זה בסדר,
            // ה-middleware ידאג לרענון.
          }
        },
      },
    },
  );
}
