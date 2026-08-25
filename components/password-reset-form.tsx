"use client";

import Link from "next/link";
import { useActionState } from "react";
import { resetPassword, type AuthFormState } from "@/lib/auth-actions";
import { PasswordInput } from "@/components/password-input";

export function PasswordResetForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(
    resetPassword,
    undefined,
  );

  if (!token) {
    return (
      <div className="mt-8 surface-card p-6 text-center">
        <h1 className="font-display text-2xl font-black tracking-tight text-stone-950">Lien invalide</h1>
        <p className="mt-2 text-stone-600">Demande un nouveau lien pour modifier ton mot de passe.</p>
        <Link className="mt-6 inline-flex rounded-2xl bg-emerald-700 px-5 py-4 font-bold text-white shadow-cta transition hover:bg-emerald-800 active:scale-[0.99]" href="/mot-de-passe-oublie">
          Recevoir un nouveau lien
        </Link>
      </div>
    );
  }

  return (
    <form className="mt-8 surface-card p-6" action={formAction}>
      <input name="token" type="hidden" value={token} />
      <h1 className="font-display text-2xl font-black tracking-tight text-stone-950">Nouveau mot de passe</h1>
      <p className="mt-2 text-stone-600">Choisis un mot de passe que tu n&apos;utilises pas ailleurs.</p>

      <label className="mt-6 block text-sm font-semibold text-stone-600" htmlFor="newPassword">
        Nouveau mot de passe
      </label>
      <PasswordInput id="newPassword" name="newPassword" autoComplete="new-password" />
      {state?.errors?.newPassword && (
        <p className="mt-2 text-sm font-semibold text-red-600">{state.errors.newPassword[0]}</p>
      )}

      <label className="mt-4 block text-sm font-semibold text-stone-600" htmlFor="confirmPassword">
        Confirmer le mot de passe
      </label>
      <PasswordInput id="confirmPassword" name="confirmPassword" autoComplete="new-password" />
      {state?.errors?.confirmPassword && (
        <p className="mt-2 text-sm font-semibold text-red-600">{state.errors.confirmPassword[0]}</p>
      )}

      {state?.message && (
        <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {state.message}
        </p>
      )}

      <button
        className="mt-6 h-14 w-full rounded-2xl bg-emerald-700 px-4 font-bold text-white shadow-cta transition hover:bg-emerald-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        type="submit"
        disabled={pending}
      >
        {pending ? "Modification..." : "Modifier mon mot de passe"}
      </button>
    </form>
  );
}
