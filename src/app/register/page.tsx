"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });
      if (error) throw error;

      if (data.session) {
        toast.success("נרשמת בהצלחה!");
        router.push("/");
        router.refresh();
      } else {
        toast.success(
          "נרשמת בהצלחה! שלחנו לך מייל אישור - לחץ על הלינק שם ואז התחבר.",
          { duration: 8000 },
        );
        router.push("/login");
      }
    } catch (err) {
      const raw = err instanceof Error ? err.message : "";
      let friendly = "שגיאה ברישום";
      if (/user already registered/i.test(raw)) {
        friendly = "המייל הזה כבר רשום. לך לדף הכניסה.";
      } else if (/password/i.test(raw) && /short/i.test(raw)) {
        friendly = "הסיסמה קצרה מדי - לפחות 6 תווים.";
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
        <p className="font-display mt-2 text-4xl text-white">הצטרפו לקולקציה.</p>
      </div>
      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
        <h1 className="font-display text-4xl">הרשמה</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          חשבון אחד שומר לכם סל, מועדפים והיסטוריית הזמנות.
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="name">שם מלא</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
            />
          </div>
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
            <Label htmlFor="password">סיסמה (לפחות 6 תווים)</Label>
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
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "נרשם..." : "הרשם"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          כבר יש לך חשבון?{" "}
          <Link href="/login" className="font-medium text-foreground underline underline-offset-4">
            כניסה
          </Link>
        </p>
        </div>
      </div>
    </div>
  );
}
