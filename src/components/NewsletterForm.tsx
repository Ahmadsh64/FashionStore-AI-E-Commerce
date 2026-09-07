"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function NewsletterForm({
  compact = false,
  tone = "default",
}: {
  compact?: boolean;
  tone?: "default" | "onDark";
}) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const onDark = tone === "onDark";

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
    <form onSubmit={submit} className={compact ? "flex gap-2" : "flex flex-col gap-2 sm:flex-row"}>
      <Input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="האימייל שלך"
        aria-label="אימייל לניוזלטר"
        className={cn(
          onDark &&
            "border-white/25 bg-transparent text-white placeholder:text-white/40 focus-visible:ring-white/40",
        )}
      />
      <Button
        type="submit"
        disabled={loading}
        className={cn(
          compact ? "" : "sm:w-auto",
          onDark && "bg-white text-[#1c1612] hover:bg-white/90",
        )}
      >
        {loading ? "שולח..." : "הרשמה"}
      </Button>
    </form>
  );
}
