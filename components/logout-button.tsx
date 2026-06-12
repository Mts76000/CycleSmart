"use client";

import { logout } from "@/lib/auth-actions";

export function LogoutButton() {
  return (
    <form action={logout}>
      <button
        className="h-14 w-full rounded-2xl border border-red-200 bg-white px-4 font-bold text-red-600"
        type="submit"
        onClick={() => {
          window.localStorage.removeItem("cyclesmart-slots");
          window.localStorage.removeItem("cyclesmart-settings");
        }}
      >
        Deconnexion
      </button>
    </form>
  );
}
