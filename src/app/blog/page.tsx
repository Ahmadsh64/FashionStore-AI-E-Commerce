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
  const [featured, ...rest] = posts;

  return (
    <div className="container py-12 md:py-16">
      <p className="kicker">השראה לארון</p>
      <h1 className="page-title mt-2">המגזין</h1>
      <p className="mt-3 max-w-xl text-muted-foreground">
        מדריכי סגנון, בחירת מידות וטיפים לקנייה חכמה — בעברית, בלי רעש.
      </p>

      {featured && (
        <Link href={`/blog/${featured.slug}`} className="group mt-12 grid gap-8 md:grid-cols-2">
          <div className="relative aspect-[16/10] overflow-hidden bg-muted">
            {featured.image_url && (
              <Image
                src={featured.image_url}
                alt={featured.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(min-width: 768px) 50vw, 100vw"
              />
            )}
          </div>
          <div className="flex flex-col justify-center">
            <p className="text-xs text-muted-foreground">{formatDate(featured.created_at)}</p>
            <h2 className="font-display mt-2 text-3xl leading-tight md:text-4xl">{featured.title}</h2>
            <p className="mt-3 text-muted-foreground">{featured.excerpt}</p>
            <span className="mt-5 text-sm tracking-wide">לקריאה</span>
          </div>
        </Link>
      )}

      <div className="mt-16 grid gap-10 md:grid-cols-3">
        {rest.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
            <div className="relative mb-4 aspect-[16/10] overflow-hidden bg-muted">
              {post.image_url && (
                <Image
                  src={post.image_url}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(min-width: 768px) 33vw, 100vw"
                />
              )}
            </div>
            <p className="text-xs text-muted-foreground">{formatDate(post.created_at)}</p>
            <h2 className="font-display mt-1 text-xl">{post.title}</h2>
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{post.excerpt}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
