"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Star } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Review } from "@/types/review";
import { summarizeReviews } from "@/types/review";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StarRating } from "@/components/StarRating";
import { cn } from "@/lib/utils";

type Props = {
  productId: string;
  initialReviews: Review[];
};

export function ProductReviews({ productId, initialReviews }: Props) {
  const [reviews, setReviews] = useState(initialReviews);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
      const meta = data.user?.user_metadata as { name?: string } | undefined;
      setUserName(meta?.name || data.user?.email?.split("@")[0] || "");
    });
  }, []);

  const summary = summarizeReviews(reviews);
  const mine = userId ? reviews.find((r) => r.user_id === userId) : null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    if (!comment.trim()) {
      toast.error("כתוב כמה מילים על המוצר");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: productId,
          rating,
          comment: comment.trim(),
          author_name: userName,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "שגיאה");
      setReviews((prev) => [data.review as Review, ...prev.filter((r) => r.user_id !== userId)]);
      setComment("");
      toast.success("הביקורת נשמרה. תודה!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "שגיאה");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mt-12 border-t pt-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">ביקורות</h2>
          <div className="mt-1">
            {summary.count === 0 ? (
              <p className="text-sm text-muted-foreground">עדיין אין ביקורות למוצר זה.</p>
            ) : (
              <StarRating value={summary.average} count={summary.count} size="md" />
            )}
          </div>
        </div>
      </div>

      {!userId ? (
        <p className="mb-6 rounded-md border bg-muted/40 p-4 text-sm">
          <Link href="/login" className="font-medium underline">
            התחבר
          </Link>{" "}
          כדי לכתוב ביקורת.
        </p>
      ) : mine ? (
        <p className="mb-6 text-sm text-muted-foreground">
          כבר כתבת ביקורת למוצר זה. אפשר לעדכן אותה בטופס למטה.
        </p>
      ) : null}

      {userId && (
        <form onSubmit={submit} className="mb-8 space-y-3 rounded-lg border bg-card p-4">
          <Label>הדירוג שלך</Label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                aria-label={`${n} כוכבים`}
              >
                <Star
                  className={cn(
                    "h-6 w-6",
                    n <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30",
                  )}
                />
              </button>
            ))}
          </div>
          <div>
            <Label htmlFor="review-comment">ביקורת</Label>
            <Textarea
              id="review-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder="איך המוצר? איכות, מידה, צבע..."
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "שולח..." : mine ? "עדכן ביקורת" : "פרסם ביקורת"}
          </Button>
        </form>
      )}

      <div className="space-y-4">
        {reviews.map((r) => (
          <article key={r.id} className="rounded-lg border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-medium">{r.author_name || "לקוח"}</div>
                <div className="text-xs text-muted-foreground">{formatDate(r.created_at)}</div>
              </div>
              <StarRating value={r.rating} />
            </div>
            {r.comment && <p className="mt-3 text-sm text-muted-foreground">{r.comment}</p>}
          </article>
        ))}
      </div>
    </section>
  );
}
