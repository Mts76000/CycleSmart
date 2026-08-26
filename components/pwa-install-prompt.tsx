"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { CloseIcon, DownloadIcon } from "@/components/icons";

const dismissKey = "cyclesmart-install-dismissed-at";
const dismissForMs = 14 * 24 * 60 * 60 * 1000;
const minVisitsBeforePrompt = 2;
const visitsKey = "cyclesmart-visit-count";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIos() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

export function PwaInstallPrompt() {
  const [deferredEvent, setDeferredEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [platform, setPlatform] = useState<"android" | "ios" | null>(null);

  useEffect(() => {
    if (isStandalone()) {
      return;
    }

    const dismissedAt = Number(window.localStorage.getItem(dismissKey) || 0);
    if (dismissedAt && Date.now() - dismissedAt < dismissForMs) {
      return;
    }

    const visits = Number(window.localStorage.getItem(visitsKey) || 0) + 1;
    window.localStorage.setItem(visitsKey, String(visits));
    if (visits < minVisitsBeforePrompt) {
      return;
    }

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setDeferredEvent(event as BeforeInstallPromptEvent);
      setPlatform("android");
      setVisible(true);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    let iosTimer: number | undefined;
    if (isIos()) {
      iosTimer = window.setTimeout(() => {
        setPlatform("ios");
        setVisible(true);
      }, 2500);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      if (iosTimer) {
        window.clearTimeout(iosTimer);
      }
    };
  }, []);

  function dismiss() {
    window.localStorage.setItem(dismissKey, String(Date.now()));
    setVisible(false);
  }

  async function install() {
    if (!deferredEvent) {
      return;
    }

    await deferredEvent.prompt();
    const choice = await deferredEvent.userChoice;
    if (choice.outcome === "accepted" || choice.outcome === "dismissed") {
      window.localStorage.setItem(dismissKey, String(Date.now()));
    }
    setVisible(false);
  }

  if (!visible || !platform) {
    return null;
  }

  return (
    <div className="shadow-card fixed inset-x-4 bottom-24 z-40 mx-auto max-w-sm rounded-[24px] bg-white p-4 md:inset-x-auto md:right-auto md:bottom-6 md:left-6">
      <div className="flex items-start gap-3">
        <Image
          alt="CycleSmart"
          className="size-11 shrink-0 rounded-xl"
          height={44}
          src="/logo-icon.png"
          width={44}
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-stone-950">Installer CycleSmart</p>
          <p className="mt-1 text-xs leading-5 text-stone-600">
            {platform === "ios"
              ? "Touche le bouton de partage puis \u00ab Sur l'ecran d'accueil \u00bb."
              : "Ajoute l'app a ton ecran d'accueil pour l'ouvrir en un geste."}
          </p>

          {platform === "android" && (
            <button
              className="mt-3 flex h-10 items-center gap-2 rounded-xl bg-emerald-700 px-3.5 text-sm font-bold text-white transition hover:bg-emerald-800 active:scale-[0.98]"
              onClick={install}
              type="button"
            >
              <DownloadIcon className="size-4" />
              Installer
            </button>
          )}
        </div>
        <button
          aria-label="Fermer"
          className="grid size-7 shrink-0 place-items-center rounded-full text-stone-600 transition hover:bg-stone-100"
          onClick={dismiss}
          type="button"
        >
          <CloseIcon className="size-4" />
        </button>
      </div>
    </div>
  );
}
