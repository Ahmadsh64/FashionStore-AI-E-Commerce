import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  value: number;
  count?: number;
  size?: "sm" | "md";
  className?: string;
};

export function StarRating({ value, count, size = "sm", className }: Props) {
  const icon = size === "sm" ? "h-3.5 w-3.5" : "h-5 w-5";
  return (
    <div className={cn("inline-flex items-center gap-1", className)}>
      <div className="flex">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            className={cn(
              icon,
              n <= Math.round(value)
                ? "fill-amber-400 text-amber-400"
                : "text-muted-foreground/30",
            )}
          />
        ))}
      </div>
      {value > 0 && (
        <span className="text-xs text-muted-foreground">
          {value.toFixed(1)}
          {typeof count === "number" && ` (${count})`}
        </span>
      )}
    </div>
  );
}
