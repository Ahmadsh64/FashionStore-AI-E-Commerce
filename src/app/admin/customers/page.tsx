import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { Profile } from "@/types/user";

export default async function AdminCustomersPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });
  const profiles = (data as Profile[]) ?? [];

  return (
    <div>
      <h1 className="text-3xl font-bold">לקוחות</h1>

      <div className="mt-6 overflow-hidden rounded-lg border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="p-3 text-right">שם</th>
              <th className="p-3 text-right">אימייל</th>
              <th className="p-3 text-right">תפקיד</th>
              <th className="p-3 text-right">נרשם</th>
            </tr>
          </thead>
          <tbody>
            {profiles.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-muted-foreground">
                  אין לקוחות עדיין.
                </td>
              </tr>
            )}
            {profiles.map((p) => (
              <tr key={p.id} className="border-b last:border-0">
                <td className="p-3 font-medium">{p.name || "—"}</td>
                <td className="p-3">{p.email}</td>
                <td className="p-3">
                  <Badge variant={p.role === "admin" ? "default" : "secondary"}>
                    {p.role}
                  </Badge>
                </td>
                <td className="p-3 text-muted-foreground">{formatDate(p.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
