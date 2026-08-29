import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;

  return (
    <div className="container flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
        <CheckCircle2 className="h-10 w-10 text-emerald-600" />
      </div>
      <h1 className="text-3xl font-bold">תודה על ההזמנה!</h1>
      <p className="mt-2 max-w-md text-muted-foreground">
        קיבלנו את ההזמנה שלך ונשלח לך אישור לאימייל.
        {order && (
          <>
            <br />
            מספר הזמנה: <span className="font-mono font-semibold">{order.slice(0, 8)}</span>
          </>
        )}
      </p>
      <div className="mt-6 flex gap-3">
        <Link href="/products">
          <Button>המשך קניות</Button>
        </Link>
        <Link href="/">
          <Button variant="outline">חזרה לדף הבית</Button>
        </Link>
      </div>
    </div>
  );
}
