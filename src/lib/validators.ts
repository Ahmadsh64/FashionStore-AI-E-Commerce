import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(2, "שם חייב להיות לפחות 2 תווים"),
  description: z.string().default(""),
  price: z.coerce.number().min(0, "מחיר חייב להיות חיובי"),
  category: z.string().min(1, "יש לבחור קטגוריה"),
  image_url: z.string().url("URL לא תקין").or(z.literal("")),
  stock: z.coerce.number().int().min(0, "מלאי חייב להיות חיובי"),
});

export type ProductFormValues = z.infer<typeof productSchema>;

export const checkoutSchema = z.object({
  full_name: z.string().min(2, "שם מלא נדרש"),
  email: z.string().email("אימייל לא תקין"),
  phone: z.string().min(9, "טלפון לא תקין"),
  address: z.string().min(5, "כתובת נדרשת"),
});

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export const authSchema = z.object({
  email: z.string().email("אימייל לא תקין"),
  password: z.string().min(6, "סיסמה של לפחות 6 תווים"),
});

export type AuthFormValues = z.infer<typeof authSchema>;
