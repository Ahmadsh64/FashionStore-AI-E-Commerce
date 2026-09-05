import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getPosts } from "@/lib/blog";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "מגזין אופנה",
  description: "טיפים, מדריכי סגנון ומאמרים מ-FashionStore.",
};

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold">מגזין FashionStore</h1>
      <p className="mt-2 text-muted-foreground">
        השראה, מדריכי קנייה וטיפים לארון ישראלי.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group overflow-hidden rounded-lg border bg-card hover:shadow-md"
          >
            <div className="relative aspect-[16/10] bg-muted">
              {post.image_url && (
                <Image
                  src={post.image_url}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                  sizes="(min-width: 768px) 33vw, 100vw"
                />
              )}
            </div>
            <div className="p-4">
              <div className="text-xs text-muted-foreground">
                {formatDate(post.created_at)}
              </div>
              <h2 className="mt-1 font-semibold">{post.title}</h2>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                {post.excerpt}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
