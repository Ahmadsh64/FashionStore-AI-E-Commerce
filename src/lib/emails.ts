import { Resend } from "resend";

/**
 * Resend client - מחזיר null אם RESEND_API_KEY לא מוגדר
 * (מאפשר לפרויקט לעבוד גם ללא מיילים).
 */
function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "FashionStore <onboarding@resend.dev>";

const currency = (n: number) =>
  new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    maximumFractionDigits: 0,
  }).format(n);

// ============================================
// מייל אישור הזמנה
// ============================================
export type OrderEmailItem = {
  name: string;
  quantity: number;
  price: number;
  size?: string;
  color?: string;
};

export async function sendOrderConfirmationEmail(params: {
  to: string;
  customerName: string;
  orderId: string;
  total: number;
  items: OrderEmailItem[];
}) {
  const resend = getResend();
  if (!resend) {
    console.log("[emails] Skipping order email (RESEND_API_KEY not set)");
    return { skipped: true };
  }

  const { to, customerName, orderId, total, items } = params;

  const itemsRows = items
    .map((i) => {
      const variant = [i.size, i.color].filter(Boolean).join(" · ");
      const name = variant ? `${i.name} <span style="color:#666">(${variant})</span>` : i.name;
      return `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #eee">${name}</td>
          <td style="padding:12px 0;border-bottom:1px solid #eee;text-align:center">${i.quantity}</td>
          <td style="padding:12px 0;border-bottom:1px solid #eee;text-align:left;white-space:nowrap">${currency(i.price * i.quantity)}</td>
        </tr>`;
    })
    .join("");

  const html = `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head><meta charset="utf-8"><title>אישור הזמנה</title></head>
<body style="margin:0;padding:0;background:#f6f7f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;color:#111">
  <div style="max-width:600px;margin:24px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 6px rgba(0,0,0,0.04)">

    <div style="background:#111;color:#fff;padding:24px 32px">
      <div style="font-size:14px;opacity:.8">FashionStore</div>
      <div style="font-size:22px;font-weight:700;margin-top:4px">✓ קיבלנו את ההזמנה שלך</div>
    </div>

    <div style="padding:32px">
      <p style="margin:0 0 8px;font-size:16px">היי ${customerName || ""} 👋</p>
      <p style="margin:0 0 24px;color:#444;line-height:1.6">
        תודה על ההזמנה! זהו אישור על ההזמנה שביצעת. ניצור איתך קשר בהקדם עם פרטי המשלוח.
      </p>

      <div style="background:#f6f7f9;border-radius:8px;padding:16px;margin-bottom:24px">
        <div style="font-size:12px;color:#666">מספר הזמנה</div>
        <div style="font-family:monospace;font-size:16px;font-weight:600">${orderId.slice(0, 8)}</div>
      </div>

      <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
        <thead>
          <tr style="text-align:right;color:#666;font-size:12px">
            <th style="padding:8px 0;border-bottom:2px solid #111">מוצר</th>
            <th style="padding:8px 0;border-bottom:2px solid #111;text-align:center;width:80px">כמות</th>
            <th style="padding:8px 0;border-bottom:2px solid #111;text-align:left;width:100px">סה"כ</th>
          </tr>
        </thead>
        <tbody>${itemsRows}</tbody>
      </table>

      <div style="text-align:left;font-size:18px;font-weight:700;padding:16px 0;border-top:2px solid #111">
        סה"כ לתשלום: ${currency(total)}
      </div>

      <div style="margin-top:32px;padding:16px;background:#fff9e6;border-radius:8px;font-size:14px;color:#664d03">
        📦 אנו נעדכן אותך במייל כשההזמנה תישלח.
      </div>

      <div style="margin-top:24px;color:#666;font-size:13px;line-height:1.6">
        שאלה? השב למייל הזה או פנה אלינו דרך האתר.
      </div>
    </div>

    <div style="background:#fafafa;padding:16px 32px;color:#888;font-size:12px;text-align:center;border-top:1px solid #eee">
      FashionStore · תודה שבחרת בנו
    </div>
  </div>
</body>
</html>`;

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: `אישור הזמנה #${orderId.slice(0, 8)} - FashionStore`,
      html,
    });
    return { ok: true, id: result.data?.id };
  } catch (err) {
    console.error("[emails] Failed to send order confirmation:", err);
    return { ok: false, error: err };
  }
}

// ============================================
// מייל עדכון סטטוס הזמנה
// ============================================
export async function sendOrderStatusEmail(params: {
  to: string;
  customerName: string;
  orderId: string;
  status: string;
  statusLabel: string;
}) {
  const resend = getResend();
  if (!resend) return { skipped: true };

  const { to, customerName, orderId, statusLabel } = params;

  const html = `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<body style="margin:0;padding:0;background:#f6f7f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;color:#111">
  <div style="max-width:600px;margin:24px auto;background:#fff;border-radius:12px;overflow:hidden">
    <div style="background:#111;color:#fff;padding:24px 32px">
      <div style="font-size:14px;opacity:.8">FashionStore</div>
      <div style="font-size:20px;font-weight:700;margin-top:4px">עדכון סטטוס הזמנה</div>
    </div>
    <div style="padding:32px">
      <p>היי ${customerName || ""},</p>
      <p>הסטטוס של הזמנה <strong>#${orderId.slice(0, 8)}</strong> עודכן ל-<strong>${statusLabel}</strong>.</p>
    </div>
  </div>
</body>
</html>`;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: `עדכון הזמנה #${orderId.slice(0, 8)}: ${statusLabel}`,
      html,
    });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err };
  }
}
