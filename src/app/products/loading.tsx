import { ProductGridSkeleton } from "@/components/ProductSkeleton";

export default function ProductsLoading() {
  return (
    <div className="container py-8">
      <div className="mb-6 h-9 w-48 animate-pulse rounded bg-muted" />
      <div className="mb-6 flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-8 w-20 animate-pulse rounded-full bg-muted" />
        ))}
      </div>
      <ProductGridSkeleton />
    </div>
  );
}
