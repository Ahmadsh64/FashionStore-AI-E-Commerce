function isValidHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function getSiteUrl() {
  const candidates = [
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, ""),
    process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : undefined,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
    "http://localhost:3000",
  ];

  for (const value of candidates) {
    if (value && isValidHttpUrl(value)) return value;
  }
  return "http://localhost:3000";
}

export const SITE_NAME = "FashionStore";
export const SITE_DESCRIPTION =
  "חנות אונליין לאופנה עדכנית: גברים, נשים, ילדים ונעליים. משלוח לכל הארץ.";
