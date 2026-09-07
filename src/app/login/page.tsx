"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success("התחברת בהצלחה");
      router.push("/");
      router.refresh();
    } catch (err) {
      const raw = err instanceof Error ? err.message : "";
      let friendly = "שגיאה בהתחברות";
      if (/invalid login credentials/i.test(raw)) {
        friendly = "אימייל או סיסמה שגויים. אם עוד לא נרשמת - הירשם קודם.";
      } else if (/email not confirmed/i.test(raw)) {
        friendly =
          "המייל עדיין לא אושר. בדוק את תיבת הדואר שלך ולחץ על הלינק לאישור.";
      } else if (raw) {
        friendly = raw;
      }
      toast.error(friendly);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-[80vh] md:grid-cols-2">
      <div className="relative hidden min-h-[40vh] bg-[#1c1612] md:flex md:flex-col md:justify-end md:p-12">
        <p className="kicker text-white/50">FashionStore</p>
        <p className="font-display mt-2 text-4xl text-white">ברוכים הבאים בחזרה.</p>
      </div>
      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
        <h1 className="font-display text-4xl">כניסה</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          התחברו כדי לראות הזמנות, מועדפים וסל שמורים לחשבון.
        </p>

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
            />
          </div>
          <div>
            <Label htmlFor="password">סיסמה</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "מתחבר..." : "התחבר"}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <Link
            href="/forgot-password"
            className="text-sm text-muted-foreground hover:text-foreground hover:underline"
          >
            שכחת סיסמה?
          </Link>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          אין לך חשבון?{" "}
          <Link href="/register" className="font-medium text-foreground underline underline-offset-4">
            הרשמה
          </Link>
        </p>
        </div>
      </div>
    </div>
  );
}
