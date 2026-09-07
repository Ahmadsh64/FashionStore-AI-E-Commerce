import Link from "next/link";
import { cn } from "@/lib/utils";

export function BrandLogo({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <Link href="/" className={cn("group flex items-baseline gap-2", className)}>
      <span className="font-display text-[1.65rem] font-medium leading-none tracking-tight">
        Fashion
      </span>
      {!compact && (
        <span className="hidden text-[10px] font-medium tracking-[0.32em] text-muted-foreground sm:inline">
          STORE
        </span>
      )}
    </Link>
  );
}
