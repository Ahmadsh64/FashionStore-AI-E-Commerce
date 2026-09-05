import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { computeCouponDiscount, type Coupon } from "@/lib/coupons";

const bodySchema = z.object({
  code: z.string().min(2),
  subtotal: z.coerce.number().min(0),
});

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "קוד קופון לא תקין" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .eq("code", parsed.data.code.trim().toUpperCase())
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: "טבלת קופונים עוד לא הוגדרה. הרץ add-marketing-features.sql" },
      { status: 503 },
    );
  }
  if (!data) {
    return NextResponse.json({ error: "קוד קופון לא נמצא" }, { status: 404 });
  }

  try {
    const result = computeCouponDiscount(data as Coupon, parsed.data.subtotal);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "קופון לא תקף" },
      { status: 400 },
    );
  }
}
