import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";
import { checkoutSchema } from "@/lib/validators";
import { computeCouponDiscount, type Coupon } from "@/lib/coupons";

const bodySchema = checkoutSchema.extend({
  total: z.coerce.number().min(1),
  shipping: z.coerce.number().min(0).default(0),
  coupon_code: z.string().optional().nullable(),
  items: z
    .array(
      z.object({
        product_id: z.string(),
        name: z.string(),
        quantity: z.number().int().min(1),
        price: z.coerce.number().min(0),
        image_url: z.string().optional().nullable(),
        size: z.string().optional().nullable(),
        color: z.string().optional().nullable(),
      }),
    )
    .min(1, "הסל ריק"),
});

export async function POST(request: Request) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      {
        error:
          "Stripe לא מוגדר. הגדר את STRIPE_SECRET_KEY ב-Environment Variables.",
      },
      { status: 503 },
    );
  }

  const body = await request.json();
  const parsed = bodySchema.safeParse(body);
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
        discount = 0;
        couponCode = null;
      }
    }
  }

  // 1) יוצרים הזמנה pending ב-DB לפני שיוצרים את ה-session
  const { data: order, error: orderErr } = await db
    .from("orders")
    .insert({
      user_id: user?.id ?? null,
      full_name: parsed.data.full_name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      address: parsed.data.address,
      total: parsed.data.total,
      payment_method: "stripe",
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

  const { error: itemsErr } = await db.from("order_items").insert(
    parsed.data.items.map((i) => ({
      order_id: order.id,
      product_id: i.product_id,
      name: i.name,
      quantity: i.quantity,
      price: i.price,
      size: i.size ?? null,
      color: i.color ?? null,
    })),
  );
  if (itemsErr) {
    return NextResponse.json({ error: itemsErr.message }, { status: 500 });
  }

  // 2) יוצרים Stripe Checkout Session
  const origin = new URL(request.url).origin;
  const currency = (process.env.STRIPE_CURRENCY || "ils").toLowerCase();

  const lineItems: import("stripe").Stripe.Checkout.SessionCreateParams.LineItem[] =
    parsed.data.items.map((i) => {
      const variantSuffix = [i.size, i.color].filter(Boolean).join(" · ");
      return {
        quantity: i.quantity,
        price_data: {
          currency,
          unit_amount: Math.round(i.price * 100),
          product_data: {
            name: variantSuffix ? `${i.name} (${variantSuffix})` : i.name,
            images:
              i.image_url && /^https?:\/\//.test(i.image_url)
                ? [i.image_url]
                : undefined,
          },
        },
      };
    });

  if (parsed.data.shipping > 0) {
    lineItems.push({
      quantity: 1,
      price_data: {
        currency,
        unit_amount: Math.round(parsed.data.shipping * 100),
        product_data: { name: "משלוח" },
      },
    });
  }

  try {
    let stripeDiscount:
      | import("stripe").Stripe.Checkout.SessionCreateParams.Discount[]
      | undefined;
    if (discount > 0) {
      const stripeCoupon = await stripe.coupons.create({
        amount_off: Math.round(discount * 100),
        currency,
        duration: "once",
        name: couponCode ?? "הנחה",
      });
      stripeDiscount = [{ coupon: stripeCoupon.id }];
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      customer_email: parsed.data.email,
      success_url: `${origin}/checkout/success?order=${order.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout?cancelled=1`,
      discounts: stripeDiscount,
      metadata: {
        order_id: order.id,
      },
      payment_intent_data: {
        metadata: { order_id: order.id },
      },
    });

    // 3) שומרים את session ID ב-order כדי שנוכל לזהות אותו ב-webhook
    await db
      .from("orders")
      .update({ stripe_session_id: session.id })
      .eq("id", order.id);

    return NextResponse.json({ url: session.url, order_id: order.id });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Stripe error";
    // מנקים את ההזמנה אם ה-session נכשל
    await db.from("orders").delete().eq("id", order.id);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
