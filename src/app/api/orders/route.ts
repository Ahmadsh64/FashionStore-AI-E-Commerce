import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkoutSchema } from "@/lib/validators";
import { computeCouponDiscount, type Coupon } from "@/lib/coupons";

const orderSchema = checkoutSchema.extend({
  total: z.coerce.number().min(0),
  coupon_code: z.string().optional().nullable(),
  items: z
    .array(
      z.object({
        product_id: z.string(),
        name: z.string(),
        quantity: z.number().int().min(1),
        price: z.coerce.number().min(0),
        size: z.string().optional().nullable(),
        color: z.string().optional().nullable(),
      }),
    )
    .min(1, "הסל ריק"),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // משתמשים ב-service role כדי לאפשר הזמנות גם ללקוחות אורחים.
  // אם אין SERVICE_ROLE_KEY - נופלים חזרה ל-client רגיל.
  const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  const db = hasServiceKey ? createAdminClient() : supabase;

  let discount = 0;
  let couponCode: string | null = null;
  if (parsed.data.coupon_code) {
    const { data: coupon } = await db
      .from("coupons")
      .select("*")
      .eq("code", parsed.data.coupon_code.trim().toUpperCase())
      .maybeSingle();
    if (coupon) {
      const subtotal = parsed.data.items.reduce(
        (s, i) => s + i.price * i.quantity,
        0,
      );
      try {
        const applied = computeCouponDiscount(coupon as Coupon, subtotal);
        discount = applied.discount;
        couponCode = applied.code;
        await db
          .from("coupons")
          .update({ used_count: (coupon.used_count ?? 0) + 1 })
          .eq("id", coupon.id);
      } catch {
        /* קופון לא תקף — ממשיכים בלי הנחה */
      }
    }
  }

  const { data: order, error: orderErr } = await db
    .from("orders")
    .insert({
      user_id: user?.id ?? null,
      full_name: parsed.data.full_name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      address: parsed.data.address,
      total: Math.max(0, parsed.data.total),
      payment_method: parsed.data.payment_method,
      status: "pending",
      coupon_code: couponCode,
      discount,
    })
    .select()
    .single();

  if (orderErr || !order) {
    return NextResponse.json(
      { error: orderErr?.message ?? "שגיאה ביצירת הזמנה" },
      { status: 500 },
    );
  }

  const itemsPayload = parsed.data.items.map((i) => ({
    order_id: order.id,
    product_id: i.product_id,
    name: i.name,
    quantity: i.quantity,
    price: i.price,
    size: i.size ?? null,
    color: i.color ?? null,
  }));

  const { error: itemsErr } = await db.from("order_items").insert(itemsPayload);
  if (itemsErr) {
    return NextResponse.json({ error: itemsErr.message }, { status: 500 });
  }

  await db
    .from("abandoned_carts")
    .update({ recovered: true })
    .eq("email", parsed.data.email.toLowerCase());

  // שליחת מייל אישור הזמנה - non-blocking, לא נכשלים אם המייל נכשל
  try {
    const { sendOrderConfirmationEmail } = await import("@/lib/emails");
    await sendOrderConfirmationEmail({
      to: parsed.data.email,
      customerName: parsed.data.full_name,
      orderId: order.id,
      total: parsed.data.total,
      items: parsed.data.items.map((i) => ({
        name: i.name,
        quantity: i.quantity,
        price: i.price,
        size: i.size ?? undefined,
        color: i.color ?? undefined,
      })),
    });
  } catch (e) {
    console.error("Failed to send order confirmation email:", e);
  }

  return NextResponse.json({ order_id: order.id }, { status: 201 });
}
