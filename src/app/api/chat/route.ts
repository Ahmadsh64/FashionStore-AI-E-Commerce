import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/types/product";

type Msg = { role: "user" | "assistant" | "system"; content: string };

/**
 * מחזיר תיאור קצר של קטלוג המוצרים ל-AI כ-context.
 */
async function buildCatalogContext(): Promise<string> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("products")
      .select("name, price, category, description, stock")
      .limit(40);
    const products = (data as Partial<Product>[]) ?? [];
    if (products.length === 0) return "אין מוצרים בקטלוג כרגע.";
    return products
      .map(
        (p, i) =>
          `${i + 1}. ${p.name} — ${p.category}, ₪${p.price}${
            p.stock === 0 ? " (אזל)" : ""
          }${p.description ? ` — ${p.description}` : ""}`,
      )
      .join("\n");
  } catch {
    return "";
  }
}

/**
 * Fallback פשוט אם אין מפתח OpenAI.
 */
function localReply(question: string, catalog: string): string {
  const q = question.toLowerCase();
  const suggestions: string[] = [];
  if (q.includes("קיץ") || q.includes("summer") || q.includes("חם")) {
    suggestions.push("Linen Shirt", "Floral Dress", "T-Shirt");
  }
  if (q.includes("חורף") || q.includes("winter") || q.includes("קר")) {
    suggestions.push("Hoodie", "Coat", "Denim Jacket");
  }
  if (q.includes("ילד") || q.includes("kid")) {
    suggestions.push("Kids T-Shirt");
  }
  if (q.includes("נעל") || q.includes("shoe") || q.includes("sneak")) {
    suggestions.push("Sneakers");
  }

  const hint =
    suggestions.length > 0
      ? `אני ממליץ לבדוק: ${suggestions.join(", ")}.`
      : "כדאי לבדוק את הקטגוריות: גברים, נשים, ילדים ונעליים.";

  return `${hint}\n\nהקטלוג הנוכחי שלנו כולל:\n${catalog.slice(0, 400)}${
    catalog.length > 400 ? "..." : ""
  }`;
}

export async function POST(request: Request) {
  try {
    const { messages } = (await request.json()) as { messages: Msg[] };
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUser) {
      return NextResponse.json({ reply: "לא הצלחתי להבין את השאלה." });
    }

    const catalog = await buildCatalogContext();
    const systemPrompt = `אתה יועץ סטייל של FashionStore, חנות אופנה אונליין.
תפקידך: להמליץ ללקוחות על מוצרים מתאימים על סמך הקטלוג שלנו.
ענה בעברית, בקצרה (2-4 משפטים), ובאופן ידידותי.
המלץ רק על מוצרים שקיימים בקטלוג הבא:

${catalog}`;

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        reply: localReply(lastUser.content, catalog),
      });
    }

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.7,
        max_tokens: 300,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.slice(-8),
        ],
      }),
    });

    if (!res.ok) {
      return NextResponse.json({
        reply: localReply(lastUser.content, catalog),
      });
    }

    const data = await res.json();
    const reply =
      data.choices?.[0]?.message?.content ??
      localReply(lastUser.content, catalog);
    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json(
      { reply: "מצטער, אירעה תקלה. נסה שוב בעוד רגע." },
      { status: 200 },
    );
  }
}
