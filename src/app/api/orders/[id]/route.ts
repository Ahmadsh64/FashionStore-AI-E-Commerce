import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth";
import { sendOrderStatusEmail } from "@/lib/emails";

const patchSchema = z.object({
  status: z.enum(["pending", "paid", "shipped", "delivered", "cancelled"]),
});

const STATUS_LABELS: Record<z.infer<typeof patchSchema>["status"], string> = {
  pending: "ממתין",
  paid: "שולם",
  shipped: "נשלח 📦",
  delivered: "נמסר ✓",
  cancelled: "בוטל",
};

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "אין הרשאה" }, { status: 403 });
  }
  const { id } = await params;
  const body = await request.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "סטטוס לא תקין" }, { status: 400 });
  }
  const supabase = await createClient();
  const { data: order, error } = await supabase
    .from("orders")
    .update({ status: parsed.data.status })
    .eq("id", id)
    .select("email, full_name")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // שולחים מייל עדכון סטטוס - שקוף לכשל
  if (order?.email) {
    try {
      await sendOrderStatusEmail({
        to: order.email,
        customerName: order.full_name ?? "",
        orderId: id,
        status: parsed.data.status,
        statusLabel: STATUS_LABELS[parsed.data.status],
      });
    } catch (e) {
      console.error("Failed to send status email:", e);
    }
  }

  return NextResponse.json({ ok: true });
}
