import Stripe from "stripe";

/**
 * מחזיר Stripe client או null אם STRIPE_SECRET_KEY לא מוגדר.
 * (מאפשר build לעבור בסביבות ללא Stripe.)
 */
export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key, {
    // @ts-expect-error - חתימת API version עשויה להיות ישנה מהחבילה
    apiVersion: "2024-11-20.acacia",
    typescript: true,
  });
}

export function isStripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY;
}
