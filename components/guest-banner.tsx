import Link from "next/link";
import { InfoIcon } from "./icons";

export function GuestBanner() {
  return (
    <div className="surface-card flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <div className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-amber-50 text-amber-600">
          <InfoIcon className="size-4" />
        </span>
        <p className="text-sm leading-6 text-stone-600">
          <span className="font-bold text-stone-950">Mode invité.</span>{" "}
          Les créneaux et réglages restent uniquement sur cet appareil.
          Connecte-toi pour les synchroniser partout.
        </p>
      </div>
      <div className="flex shrink-0 gap-2 sm:pl-4">
        <Link
          className="h-11 rounded-2xl bg-emerald-700 px-4 text-sm font-bold text-white transition hover:bg-emerald-800 active:scale-[0.98]"
          href="/inscription"
        >
          Créer un compte
        </Link>
        <Link
          className="h-11 rounded-2xl bg-emerald-50 px-4 text-sm font-bold text-emerald-700 transition hover:bg-emerald-100 active:scale-[0.98]"
          href="/connexion"
        >
          Connexion
        </Link>
      </div>
    </div>
  );
}
