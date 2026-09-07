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
    <div className="container grid gap-12 py-16 md:grid-cols-2">
      <div>
        <p className="kicker">שירות לקוחות</p>
        <h1 className="page-title mt-2">נשמח לשמוע</h1>
        <p className="mt-4 max-w-md text-sm leading-7 text-muted-foreground">
          שאלה על מידה, הזמנה או שיתוף פעולה? כתבו לנו ונחזור בהקדם. אפשר גם בוואטסאפ מהכפתור באתר.
        </p>
        <div className="mt-8 space-y-4 text-sm">
          <p><span className="text-muted-foreground">שעות מענה:</span> א׳–ה׳ 9:00–18:00</p>
          <p><span className="text-muted-foreground">משלוחים:</span> 2–5 ימי עסקים בכל הארץ</p>
        </div>
      </div>
      <form onSubmit={submit} className="space-y-4">
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
        <Button type="submit" disabled={loading} size="lg" className="w-full md:w-auto">
          {loading ? "שולח..." : "שליחת הודעה"}
        </Button>
      </form>
    </div>
  );
}
