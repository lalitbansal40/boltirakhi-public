export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-20">
      <div className="mx-auto size-8 animate-spin rounded-full border-2 border-line border-t-brand" />
      <p className="mt-4 text-center text-sm text-muted">Loading…</p>
    </div>
  );
}
