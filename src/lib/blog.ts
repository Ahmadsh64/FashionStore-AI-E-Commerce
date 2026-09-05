import { createClient } from "@/lib/supabase/server";
import type { Post } from "@/types/coupon";

export const FALLBACK_POSTS: Post[] = [
  {
    id: "fallback-1",
    slug: "madrikh-kayits-2026",
    title: "מדריך סגנון לקיץ 2026",
    excerpt: "איך לבנות ארון קיץ קליל שלא נראה כמו כולם.",
    content:
      "הקיץ הזה מדבר פשתן, כותנה וצבעים בהירים.\n\nהתחילו מחולצה לבנה טובה ומכנסיים רחבים. הוסיפו נעליים פשוטות ושקית בד אחת.\n\nטיפ: עדיף שלושה פריטים איכותיים על עשרה זולים שיישברו אחרי כביסה אחת.",
    image_url: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1200",
    published: true,
    created_at: "2026-06-01T00:00:00.000Z",
  },
  {
    id: "fallback-2",
    slug: "eikh-livhor-midah",
    title: "איך לבחור מידה אונליין בלי להחזיר",
    excerpt: "טבלת מידות, בד וגזרה — מה באמת חשוב.",
    content:
      "מדדו חזה, מותן וירך עם סרט מדידה. השוו לטבלה של המוצר, לא למידה הרגילה שלכם בחנות אחרת.\n\nאם אתם בין מידות — בגדים רחבים עדיף לקחת גדול, וגזרה צמודה עדיף מדויקת.",
    image_url: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=1200",
    published: true,
    created_at: "2026-06-15T00:00:00.000Z",
  },
  {
    id: "fallback-3",
    slug: "kapsula-wardrob",
    title: "ארון קפסולה ישראלי: 12 פריטים",
    excerpt: "פחות בגדים, יותר שילובים — גם לימי חול וגם לערב.",
    content:
      "הבסיס: ג'ינס כהה, מכנסיים שחורים, חולצה לבנה, חולצה מכופתרת, סריג, ז'קט קל, נעלי סניקרס, נעליים אלגנטיות, חולצת טי שחורה, חצאית או מכנסיים בהירים, מעיל ביניים, ופריט אחד שמח.",
    image_url: "https://images.unsplash.com/photo-1489987707025-901f5e8bed6b?w=1200",
    published: true,
    created_at: "2026-07-01T00:00:00.000Z",
  },
];

export async function getPosts(): Promise<Post[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: false });
    if (error || !data?.length) return FALLBACK_POSTS;
    return data as Post[];
  } catch {
    return FALLBACK_POSTS;
  }
}

export async function getPost(slug: string): Promise<Post | null> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("posts")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (data) return data as Post;
  } catch {
    /* fallback */
  }
  return FALLBACK_POSTS.find((p) => p.slug === slug) ?? null;
}
