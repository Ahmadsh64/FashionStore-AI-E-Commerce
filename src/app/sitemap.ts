import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { getPosts } from "@/lib/blog";
import { getSiteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const staticPaths = [
    "",
    "/products",
    "/blog",
    "/about",
    "/contact",
    "/faq",
    "/shipping",
    "/terms",
    "/privacy",
  ];

  const entries: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: `${base}${path || "/"}`,
    lastModified: new Date(),
    changeFrequency: path === "" || path === "/products" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.7,
  }));

  try {
    const supabase = await createClient();
    const { data: products } = await supabase.from("products").select("id, created_at");
    for (const p of products ?? []) {
      entries.push({
        url: `${base}/product/${p.id}`,
        lastModified: p.created_at ? new Date(p.created_at) : new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
  } catch {
    /* ignore */
  }

  for (const post of await getPosts()) {
    entries.push({
      url: `${base}/blog/${post.slug}`,
      lastModified: new Date(post.created_at),
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  return entries;
}
