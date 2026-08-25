"use client";

import { logout } from "@/lib/auth-actions";

export function LogoutButton() {
  return (
    <form action={logout}>
      <button
        className="inline-flex h-11 w-full items-center justify-center rounded-full border border-stone-200 bg-white px-4 text-sm font-bold text-stone-700 transition hover:bg-stone-50 active:scale-[0.98]"
        type="submit"
        onClick={() => {
          window.localStorage.removeItem("cyclesmart-slots");
          window.localStorage.removeItem("cyclesmart-settings");
        }}
      >
        Déconnexion
      </button>
    </form>
  );
}
