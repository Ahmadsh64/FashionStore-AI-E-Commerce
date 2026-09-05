export default function CartLoading() {
  return (
    <div className="container py-8">
      <div className="mb-6 h-9 w-32 animate-pulse rounded bg-muted" />
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    </div>
  );
}
