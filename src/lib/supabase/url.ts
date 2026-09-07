/**
 * מחזיר את כתובת ה-API של Supabase.
 * אם הודבקה כתובת דשבורד / dummy — מחלצים את ה-ref ממפתח ה-anon.
 */
function projectRefFromAnonKey(key: string) {
  try {
    const payload = key.split(".")[1];
    if (!payload) return "";
    const json = JSON.parse(
      Buffer.from(payload.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8"),
    ) as { ref?: string };
    return typeof json.ref === "string" ? json.ref : "";
  } catch {
    return "";
  }
}

export function getSupabaseUrl() {
  const raw = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim().replace(/\/$/, "");
  const dashboard = raw.match(/supabase\.com\/dashboard\/project\/([a-z0-9]+)/i);
  if (dashboard) return `https://${dashboard[1]}.supabase.co`;

  const dummy = /dummy\.supabase\.co/i.test(raw);
  const valid = /^https:\/\/[a-z0-9]+\.supabase\.co$/i.test(raw);
  if (valid && !dummy) return raw;

  const ref = projectRefFromAnonKey(getSupabaseAnonKey());
  if (ref) return `https://${ref}.supabase.co`;
  return raw;
}

export function getSupabaseAnonKey() {
  const key = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim();
  if (key.length > 40 && key.includes(".")) return key;
  return "";
}

