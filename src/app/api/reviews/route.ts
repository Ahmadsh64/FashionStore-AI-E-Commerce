import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const reviewSchema = z.object({
  product_id: z.string().uuid(),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().min(2, "כתוב לפחות 2 תווים").max(1000),
  author_name: z.string().max(80).default(""),
});

export async function GET(request: Request) {
  const productId = new URL(request.url).searchParams.get("product_id");
  if (!productId) {
    return NextResponse.json({ error: "חסר product_id" }, { status: 400 });
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ reviews: data ?? [] });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "יש להתחבר כדי לכתוב ביקורת" }, { status: 401 });
  }

  const parsed = reviewSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 },
    );
  }

  const payload = {
    product_id: parsed.data.product_id,
    user_id: user.id,
    author_name:
      parsed.data.author_name ||
      (user.user_metadata?.name as string | undefined) ||
      user.email?.split("@")[0] ||
      "לקוח",
    rating: parsed.data.rating,
    comment: parsed.data.comment,
  };

  const { data, error } = await supabase
    .from("reviews")
    .upsert(payload, { onConflict: "product_id,user_id" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ review: data }, { status: 201 });
}
