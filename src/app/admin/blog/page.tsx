"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function AdminBlogPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    image_url: "",
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, published: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "שגיאה");
      toast.success("המאמר פורסם");
      router.push(`/blog/${data.post.slug}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "שגיאה");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold">מאמר חדש</h1>
      <form onSubmit={submit} className="mt-6 max-w-2xl space-y-4">
        <div>
          <Label>כותרת</Label>
          <Input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
        </div>
        <div>
          <Label>Slug (באנגלית)</Label>
          <Input
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            placeholder="summer-guide"
            required
          />
        </div>
        <div>
          <Label>תקציר</Label>
          <Input
            value={form.excerpt}
            onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
          />
        </div>
        <div>
          <Label>תמונה URL</Label>
          <Input
            value={form.image_url}
            onChange={(e) => setForm({ ...form, image_url: e.target.value })}
          />
        </div>
        <div>
          <Label>תוכן</Label>
          <Textarea
            rows={10}
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            required
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? "מפרסם..." : "פרסם"}
        </Button>
      </form>
    </div>
  );
}
