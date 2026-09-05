"use client";

import { Heart } from "lucide-react";
import { toast } from "sonner";
import { useWishlist } from "@/store/wishlist";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  productId: string;
  productName?: string;
  size?: "sm" | "icon" | "lg";
  className?: string;
};

export function WishlistButton({
  productId,
  productName,
  size = "icon",
  className,
}: Props) {
  const has = useWishlist((s) => s.has(productId));
  const toggle = useWishlist((s) => s.toggle);

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(productId);
    toast.success(
      has
        ? `${productName ?? "המוצר"} הוסר מהמועדפים`
        : `${productName ?? "המוצר"} נוסף למועדפים`,
    );
  };

  return (
    <Button
      type="button"
      size={size === "lg" ? "icon" : size}
      variant="outline"
      onClick={onClick}
      aria-label={has ? "הסר ממועדפים" : "הוסף למועדפים"}
      className={cn(size === "lg" && "h-11 w-11", className)}
    >
      <Heart
        className={cn("h-4 w-4", has && "fill-rose-500 text-rose-500")}
      />
    </Button>
  );
}
