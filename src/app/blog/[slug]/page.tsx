import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPost, getPosts } from "@/lib/blog";
import { formatDate } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "מאמר" };
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.image_url ? [{ url: post.image_url }] : undefined,
      type: "article",
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();
  const others = (await getPosts()).filter((p) => p.slug !== slug).slice(0, 3);

  return (
    <article className="container max-w-3xl py-10">
      <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground">
        ← חזרה למגזין
      </Link>
      <h1 className="mt-4 text-3xl font-bold">{post.title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{formatDate(post.created_at)}</p>
      {post.image_url && (
        <div className="relative mt-6 aspect-[16/8] overflow-hidden rounded-lg bg-muted">
          <Image src={post.image_url} alt={post.title} fill className="object-cover" sizes="800px" />
        </div>
      )}
      <div className="mt-8 whitespace-pre-line text-base leading-7 text-foreground/90">
        {post.content}
      </div>

      {others.length > 0 && (
        <div className="mt-12 border-t pt-6">
          <h2 className="mb-3 font-semibold">עוד מהמגזין</h2>
          <ul className="space-y-2 text-sm">
            {others.map((p) => (
              <li key={p.slug}>
                <Link href={`/blog/${p.slug}`} className="hover:underline">
                  {p.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}
