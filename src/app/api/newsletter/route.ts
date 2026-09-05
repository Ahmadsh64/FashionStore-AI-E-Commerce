import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  email: z.string().email("אימייל לא תקין"),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("newsletter")
    .insert({ email: parsed.data.email.toLowerCase() });

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ ok: true, already: true });
    }
    return NextResponse.json(
      { error: "הרשמה לניוזלטר נכשלה. ודא שהרצת add-marketing-features.sql" },
      { status: 500 },
    );
  }
  return NextResponse.json({ ok: true });
}
