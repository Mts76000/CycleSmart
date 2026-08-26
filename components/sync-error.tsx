"use client";

import { useCycle } from "@/lib/cycle-store";

export function SyncErrorBanner() {
  const { syncStatus } = useCycle();

  if (syncStatus !== "error") {
    return null;
  }

  return (
    <div
      className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700"
      role="status"
      aria-live="polite"
    >
      Impossible de synchroniser avec le serveur. Vos modifications restent enregistrées localement.
    </div>
  );
}
