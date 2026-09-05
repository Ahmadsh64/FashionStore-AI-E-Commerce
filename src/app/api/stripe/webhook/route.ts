import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

// חשוב: Stripe שולח raw body - Next 15 יודע לתת text() כך שהחתימה נשארת אמינה.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !webhookSecret) {
    return NextResponse.json(
      { error: "Stripe webhook not configured" },
      { status: 503 },
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 },
    );
  }

  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const db = createAdminClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.order_id;
        const paymentIntentId =
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent?.id;

        if (orderId) {
          await db
            .from("orders")
            .update({
              status: "paid",
              stripe_payment_intent: paymentIntentId ?? null,
            })
            .eq("id", orderId);

          // שליחת מייל אישור לאחר תשלום מוצלח
          try {
            const { data: order } = await db
              .from("orders")
              .select("*, items:order_items(*)")
              .eq("id", orderId)
              .single();
            if (order) {
              const { sendOrderConfirmationEmail } = await import(
                "@/lib/emails"
              );
              await sendOrderConfirmationEmail({
                to: order.email,
                customerName: order.full_name,
                orderId: order.id,
                total: Number(order.total),
                items: (order.items ?? []).map(
                  (i: {
                    name: string;
                    quantity: number;
                    price: number;
                    size: string | null;
                    color: string | null;
                  }) => ({
                    name: i.name,
                    quantity: i.quantity,
                    price: Number(i.price),
                    size: i.size ?? undefined,
                    color: i.color ?? undefined,
                  }),
                ),
              });
            }
          } catch (e) {
            console.error("Failed to send confirmation email:", e);
          }
        }
        break;
      }

      case "checkout.session.expired":
      case "checkout.session.async_payment_failed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.order_id;
        if (orderId) {
          await db
            .from("orders")
            .update({ status: "cancelled" })
            .eq("id", orderId);
        }
        break;
      }

      default:
        // אפשר להוסיף עוד event types בעתיד
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Handler error";
    console.error("Stripe webhook handler error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
