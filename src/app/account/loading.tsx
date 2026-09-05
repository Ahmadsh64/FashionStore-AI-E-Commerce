export default function AccountLoading() {
  return (
    <div className="container py-8">
      <div className="mb-8 h-9 w-40 animate-pulse rounded bg-muted" />
      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <div className="h-64 animate-pulse rounded-lg bg-muted" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    </div>
  );
}
