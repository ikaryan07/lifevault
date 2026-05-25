export default function DashboardLoading() {
  return (
    <div className="animate-pulse space-y-4" role="status" aria-label="Loading page">
      <div className="h-8 w-48 rounded-lg bg-muted" />
      <div className="h-4 w-full max-w-md rounded bg-muted" />
      <div className="mt-6 space-y-3">
        <div className="h-20 rounded-xl bg-muted" />
        <div className="h-20 rounded-xl bg-muted" />
        <div className="h-20 rounded-xl bg-muted" />
      </div>
    </div>
  );
}
