"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { KeyRound, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [done, setDone] = useState(false);

  // Supabase שולח PASSWORD_RECOVERY event ברגע שמגיעים לדף מהלינק
  useEffect(() => {
    const supabase = createClient();
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setReady(true);
      }
    });
    // אם המשתמש כבר מחובר (מגיע מהלינק) - אפשר לאפס
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("סיסמה חייבת להיות לפחות 6 תווים");
      return;
    }
    if (password !== confirm) {
      toast.error("הסיסמאות לא תואמות");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setDone(true);
      toast.success("הסיסמה עודכנה בהצלחה");
      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 2000);
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
          {done ? (
            <Check className="h-6 w-6 text-emerald-600" />
          ) : (
            <KeyRound className="h-6 w-6 text-primary" />
          )}
        </div>

        <h1 className="text-2xl font-bold">
          {done ? "הסיסמה עודכנה!" : "איפוס סיסמה"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {done
            ? "מיד תועבר לדף הבית..."
            : ready
              ? "בחר סיסמה חדשה לחשבון שלך."
              : "טוען את הסשן שלך..."}
        </p>

        {!done && ready && (
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <Label htmlFor="password">סיסמה חדשה</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>
            <div>
              <Label htmlFor="confirm">אישור סיסמה</Label>
              <Input
                id="confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "מעדכן..." : "עדכן סיסמה"}
            </Button>
          </form>
        )}

        {!ready && !done && (
          <p className="mt-6 text-sm text-muted-foreground">
            אם לא הגעת מלינק במייל -{" "}
            <Link href="/forgot-password" className="underline hover:text-foreground">
              בקש לינק חדש
            </Link>
            .
          </p>
        )}
      </div>
    </div>
  );
}
