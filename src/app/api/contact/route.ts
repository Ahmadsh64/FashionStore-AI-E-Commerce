import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { sendContactNotification } from "@/lib/emails";

const schema = z.object({
  name: z.string().min(2, "שם נדרש"),
  email: z.string().email("אימייל לא תקין"),
  message: z.string().min(10, "ההודעה קצרה מדי"),
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
  await supabase.from("contact_messages").insert(parsed.data);

  try {
    await sendContactNotification(parsed.data);
  } catch (e) {
    console.error("contact email failed", e);
  }

  return NextResponse.json({ ok: true });
}
