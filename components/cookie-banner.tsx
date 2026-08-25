"use client";

import { useState, useSyncExternalStore } from "react";
import { InfoIcon } from "./icons";

const consentKey = "cyclesmart-cookies-accepted";

function getConsent() {
  try {
    return window.localStorage.getItem(consentKey) === "true";
  } catch {
    return true;
  }
}

function useStoredConsent() {
  return useSyncExternalStore(
    (callback) => {
      const handler = (event: StorageEvent) => {
        if (event.key === consentKey) {
          callback();
        }
      };
      window.addEventListener("storage", handler);
      return () => window.removeEventListener("storage", handler);
    },
    getConsent,
    () => true,
  );
}

export function CookieBanner() {
  const storedAccepted = useStoredConsent();
  const [dismissed, setDismissed] = useState(false);

  function accept() {
    try {
      window.localStorage.setItem(consentKey, "true");
    } catch {
      // ignore
    }
    setDismissed(true);
  }

  if (storedAccepted || dismissed) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-3">
      <div className="surface-card mx-auto flex max-w-3xl flex-col gap-3 rounded-2xl p-4 shadow-2xl sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
            <InfoIcon className="size-4" />
          </span>
          <p className="text-sm leading-5 text-stone-600">
            CycleSmart utilise un cookie de session et le stockage local pour fonctionner. Aucun
            cookie publicitaire. En continuant, tu acceptes cette utilisation.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            className="h-10 rounded-xl bg-emerald-700 px-4 text-sm font-bold text-white transition hover:bg-emerald-800 active:scale-[0.98]"
            type="button"
            onClick={accept}
          >
            J&apos;ai compris
          </button>
        </div>
      </div>
    </div>
  );
}
