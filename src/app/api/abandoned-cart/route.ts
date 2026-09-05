import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

const itemSchema = z.object({
  name: z.string(),
  quantity: z.number().int().min(1),
  price: z.number().min(0),
});

const saveSchema = z.object({
  email: z.string().email(),
  full_name: z.string().optional().default(""),
  items: z.array(itemSchema).min(1),
  total: z.coerce.number().min(0),
});

function db() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  return createAdminClient();
}

export async function POST(request: Request) {
  const parsed = saveSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const admin = db();
  if (!admin) return NextResponse.json({ ok: true, skipped: true });

  const email = parsed.data.email.toLowerCase();
  const { error } = await admin.from("abandoned_carts").upsert(
    {
      email,
      full_name: parsed.data.full_name,
      items: parsed.data.items,
      total: parsed.data.total,
      recovered: false,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "email" },
  );
  if (error) {
    console.error("abandoned cart save", error.message);
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const email = new URL(request.url).searchParams.get("email");
  if (!email) return NextResponse.json({ ok: true });
  const admin = db();
  if (!admin) return NextResponse.json({ ok: true });
  await admin
    .from("abandoned_carts")
    .update({ recovered: true, updated_at: new Date().toISOString() })
    .eq("email", email.toLowerCase());
  return NextResponse.json({ ok: true });
}
