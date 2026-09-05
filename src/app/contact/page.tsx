"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "שגיאה");
      toast.success("ההודעה נשלחה. נחזור אליך בהקדם.");
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "שגיאה");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-xl py-12">
      <h1 className="text-3xl font-bold">צור קשר</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        שאלה על הזמנה, מידה או שיתוף פעולה? כתבו לנו.
      </p>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <div>
          <Label htmlFor="name">שם</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="email">אימייל</Label>
          <Input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="message">הודעה</Label>
          <Textarea
            id="message"
            rows={5}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            required
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? "שולח..." : "שלח"}
        </Button>
      </form>
    </div>
  );
}
