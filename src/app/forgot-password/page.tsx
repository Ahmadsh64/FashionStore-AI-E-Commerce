"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Mail, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const supabase = createClient();
      const redirectTo = `${window.location.origin}/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });
      if (error) throw error;
      setSent(true);
      toast.success("נשלח לך מייל לאיפוס סיסמה");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "שגיאה";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container flex min-h-[80vh] items-center justify-center py-12">
      <div className="w-full max-w-md rounded-lg border bg-card p-8">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Mail className="h-6 w-6 text-primary" />
        </div>

        <h1 className="text-2xl font-bold">שכחתי סיסמה</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {sent
            ? "בדוק את תיבת הדואר שלך והקלק על הלינק שקיבלת כדי לאפס את הסיסמה."
            : "הזן את האימייל שלך ונשלח לך לינק לאיפוס הסיסמה."}
        </p>

        {!sent ? (
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <Label htmlFor="email">אימייל</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@example.com"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "שולח..." : "שלח לינק לאיפוס"}
            </Button>
          </form>
        ) : (
          <div className="mt-6 space-y-3">
            <div className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200">
              ✓ המייל נשלח ל-<span className="font-medium">{email}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              לא רואה את המייל? בדוק את תיקיית ה-Spam.
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setSent(false)}
            >
              שלח שוב
            </Button>
          </div>
        )}

        <p className="mt-6 text-center text-sm">
          <Link
            href="/login"
            className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground hover:underline"
          >
            <ArrowRight className="h-3 w-3" />
            חזרה להתחברות
          </Link>
        </p>
      </div>
    </div>
  );
}
