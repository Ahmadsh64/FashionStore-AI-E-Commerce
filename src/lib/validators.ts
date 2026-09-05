import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(2, "שם חייב להיות לפחות 2 תווים"),
  description: z.string().default(""),
  price: z.coerce.number().min(0, "מחיר חייב להיות חיובי"),
  category: z.string().min(1, "יש לבחור קטגוריה"),
  brand: z.string().default(""),
  image_url: z.string().url("URL לא תקין").or(z.literal("")),
  images: z.array(z.string().url()).default([]),
  sizes: z.array(z.string().min(1)).default([]),
  colors: z.array(z.string().min(1)).default([]),
  stock: z.coerce.number().int().min(0, "מלאי חייב להיות חיובי"),
});

export type ProductFormValues = z.infer<typeof productSchema>;

export const PAYMENT_METHODS = [
  "stripe",
  "credit_card",
  "bit",
  "paypal",
  "paybox",
  "cash_on_delivery",
  "bank_transfer",
] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  stripe: "Stripe (מאובטח)",
  credit_card: "כרטיס אשראי",
  bit: "Bit",
  paypal: "PayPal",
  paybox: "PayBox",
  cash_on_delivery: "מזומן במסירה",
  bank_transfer: "העברה בנקאית",
};

export const checkoutSchema = z.object({
  full_name: z.string().min(2, "שם מלא נדרש"),
  email: z.string().email("אימייל לא תקין"),
  phone: z.string().min(9, "טלפון לא תקין"),
  address: z.string().min(5, "כתובת נדרשת"),
  payment_method: z.enum(PAYMENT_METHODS, {
    message: "יש לבחור אמצעי תשלום",
  }),
});

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export const creditCardSchema = z.object({
  card_holder: z.string().min(2, "יש להזין שם בעל הכרטיס"),
  card_number: z
    .string()
    .transform((v) => v.replace(/\s/g, ""))
    .pipe(
      z
        .string()
        .regex(/^\d{13,19}$/, "מספר כרטיס לא תקין"),
    ),
  expiry: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "תוקף בפורמט MM/YY"),
  cvv: z.string().regex(/^\d{3,4}$/, "CVV חייב 3-4 ספרות"),
});

export type CreditCardFormValues = z.infer<typeof creditCardSchema>;

export const authSchema = z.object({
  email: z.string().email("אימייל לא תקין"),
  password: z.string().min(6, "סיסמה של לפחות 6 תווים"),
});

export type AuthFormValues = z.infer<typeof authSchema>;
