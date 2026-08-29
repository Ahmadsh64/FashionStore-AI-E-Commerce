import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container flex flex-col items-center justify-center py-24 text-center">
      <h1 className="text-3xl font-bold">מוצר לא נמצא</h1>
      <p className="mt-2 text-muted-foreground">אולי המוצר הוסר או שהקישור שגוי.</p>
      <Link href="/products" className="mt-6">
        <Button>חזרה לקטלוג</Button>
      </Link>
    </div>
  );
}
