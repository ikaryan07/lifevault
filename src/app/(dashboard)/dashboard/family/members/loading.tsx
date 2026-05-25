export default function FamilyMembersLoading() {
  return (
    <div className="animate-pulse space-y-6" role="status" aria-label="Loading family members">
      <div className="space-y-2">
        <div className="h-8 w-48 rounded-lg bg-muted" />
        <div className="h-4 w-full max-w-lg rounded bg-muted" />
      </div>
      <div className="h-48 rounded-xl bg-muted" />
      <div className="h-40 rounded-xl bg-muted" />
    </div>
  );
}
