import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/user";

/**
 * מחזיר את המשתמש הנוכחי או null אם לא מחובר.
 */
export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * מחזיר את הפרופיל של המשתמש הנוכחי (עם role).
 */
export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error || !data) return null;
  return data as Profile;
}

/**
 * מחזיר true אם המשתמש הנוכחי הוא אדמין.
 */
export async function isAdmin(): Promise<boolean> {
  const profile = await getCurrentProfile();
  return profile?.role === "admin";
}
