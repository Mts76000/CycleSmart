"use client";

import { deleteAccount } from "@/lib/auth-actions";

export function DeleteAccountButton() {
  return (
    <form
      action={deleteAccount}
      onSubmit={(event) => {
        const confirmed = window.confirm(
          "Tu es sur le point de supprimer ton compte. Cette action anonymisera tes données personnelles et est irreversible. Continuer ?",
        );
        if (!confirmed) {
          event.preventDefault();
        } else {
          window.localStorage.removeItem("cyclesmart-slots");
          window.localStorage.removeItem("cyclesmart-settings");
        }
      }}
    >
      <button
        className="inline-flex h-11 w-full items-center justify-center rounded-full border border-stone-200 bg-white px-4 text-sm font-bold text-stone-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 active:scale-[0.98]"
        type="submit"
      >
        Supprimer mon compte
      </button>
    </form>
  );
}
