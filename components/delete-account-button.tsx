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
        className="h-14 w-full rounded-2xl border border-red-200 bg-red-50 px-4 font-bold text-red-600 transition hover:bg-red-100 active:scale-[0.99]"
        type="submit"
      >
        Supprimer mon compte
      </button>
    </form>
  );
}
