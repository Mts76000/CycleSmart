"use client";

export function CycleLoading() {
  return (
    <div className="space-y-5">
      <div className="surface-hero h-64 w-full animate-pulse rounded-2xl p-5 sm:h-72" />
      <div className="surface-card h-32 w-full animate-pulse rounded-2xl" />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="surface-card h-24 w-full animate-pulse rounded-2xl" />
        <div className="surface-card h-24 w-full animate-pulse rounded-2xl" />
      </div>
    </div>
  );
}
