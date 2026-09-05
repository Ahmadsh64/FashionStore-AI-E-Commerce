import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth";

const couponSchema = z.object({
  code: z.string().min(2).transform((v) => v.trim().toUpperCase()),
  type: z.enum(["percent", "fixed"]),
  value: z.coerce.number().positive(),
  min_order: z.coerce.number().min(0).default(0),
  max_uses: z.coerce.number().int().positive().optional().nullable(),
  active: z.boolean().default(true),
  expires_at: z.string().optional().nullable(),
});

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "אין הרשאה" }, { status: 403 });
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ coupons: data ?? [] });
}

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "אין הרשאה" }, { status: 403 });
  }
  const parsed = couponSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 },
    );
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("coupons")
    .insert(parsed.data)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ coupon: data }, { status: 201 });
}

export async function PATCH(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "אין הרשאה" }, { status: 403 });
  }
  const body = await request.json();
  const id = z.string().uuid().safeParse(body.id);
  if (!id.success) {
    return NextResponse.json({ error: "חסר id" }, { status: 400 });
  }
  const supabase = await createClient();
  const { error } = await supabase
    .from("coupons")
    .update({ active: !!body.active })
    .eq("id", id.data);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
