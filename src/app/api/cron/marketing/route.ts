import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendAbandonedCartEmail, sendWinbackEmail } from "@/lib/emails";
import { getSiteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function authorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = request.headers.get("authorization");
  return header === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ skipped: true, reason: "no service role" });
  }

  const db = createAdminClient();
  const site = getSiteUrl();
  const now = Date.now();
  let abandoned = 0;
  let winbacks = 0;

  const { data: carts } = await db
    .from("abandoned_carts")
    .select("*")
    .eq("recovered", false)
    .is("emailed_at", null);

  for (const cart of carts ?? []) {
    const age = now - new Date(cart.updated_at).getTime();
    if (age < 60 * 60 * 1000) continue;
    if (!cart.items?.length) continue;

    try {
      await sendAbandonedCartEmail({
        to: cart.email,
        customerName: cart.full_name,
        items: cart.items,
        total: Number(cart.total),
        checkoutUrl: `${site}/cart`,
      });
      await db
        .from("abandoned_carts")
        .update({ emailed_at: new Date().toISOString() })
        .eq("id", cart.id);
      await db.from("marketing_sends").insert({
        email: cart.email,
        kind: "abandoned",
      });
      abandoned += 1;
    } catch (e) {
      console.error("abandoned email", e);
    }
  }

  const since = new Date(now - 21 * 24 * 60 * 60 * 1000).toISOString();
  const older = new Date(now - 90 * 24 * 60 * 60 * 1000).toISOString();
  const { data: oldOrders } = await db
    .from("orders")
    .select("email, full_name, created_at")
    .neq("status", "cancelled")
    .lt("created_at", since)
    .gt("created_at", older);

  const candidates = new Map<string, string>();
  for (const o of oldOrders ?? []) {
    if (o.email && !candidates.has(o.email.toLowerCase())) {
      candidates.set(o.email.toLowerCase(), o.full_name ?? "");
    }
  }

  const { data: recentOrders } = await db
    .from("orders")
    .select("email")
    .gte("created_at", since);
  const recent = new Set(
    (recentOrders ?? []).map((o) => String(o.email).toLowerCase()),
  );

  const winbackSince = new Date(now - 60 * 24 * 60 * 60 * 1000).toISOString();
  const { data: already } = await db
    .from("marketing_sends")
    .select("email")
    .eq("kind", "winback")
    .gte("sent_at", winbackSince);
  const sent = new Set((already ?? []).map((r) => String(r.email).toLowerCase()));

  for (const [email, name] of candidates) {
    if (recent.has(email) || sent.has(email)) continue;
    try {
      await sendWinbackEmail({
        to: email,
        customerName: name,
        shopUrl: `${site}/products`,
        coupon: "WELCOME10",
      });
      await db.from("marketing_sends").insert({ email, kind: "winback" });
      winbacks += 1;
    } catch (e) {
      console.error("winback email", e);
    }
  }

  return NextResponse.json({ ok: true, abandoned, winbacks });
}
