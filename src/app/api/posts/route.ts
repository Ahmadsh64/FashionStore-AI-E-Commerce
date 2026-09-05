import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth";

const postSchema = z.object({
  slug: z
    .string()
    .min(2)
    .transform((v) =>
      v
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9\u0590-\u05FF-]/g, ""),
    ),
  title: z.string().min(2),
  excerpt: z.string().default(""),
  content: z.string().min(10),
  image_url: z.string().url().or(z.literal("")).default(""),
  published: z.boolean().default(true),
});

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "אין הרשאה" }, { status: 403 });
  }
  const parsed = postSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 },
    );
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .insert(parsed.data)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ post: data }, { status: 201 });
}
