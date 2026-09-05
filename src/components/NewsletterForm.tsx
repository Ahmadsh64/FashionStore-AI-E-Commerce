"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function NewsletterForm({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "שגיאה");
      toast.success(
        data.already ? "האימייל כבר רשום אצלנו" : "נרשמת לניוזלטר. תודה!",
      );
      setEmail("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "שגיאה");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className={compact ? "flex gap-2" : "space-y-2"}>
      <Input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="האימייל שלך"
        aria-label="אימייל לניוזלטר"
      />
      <Button type="submit" disabled={loading} className={compact ? "" : "w-full"}>
        {loading ? "שולח..." : "הרשמה"}
      </Button>
    </form>
  );
}
