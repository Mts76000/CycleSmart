"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestPasswordReset, type AuthFormState } from "@/lib/auth-actions";

export function PasswordResetRequestForm() {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(
    requestPasswordReset,
    undefined,
  );

  return (
    <form className="mt-8 surface-card p-6" action={formAction}>
      <h1 className="font-display text-2xl font-black tracking-tight text-stone-950">Mot de passe oublie</h1>
      <p className="mt-2 text-stone-600">
        Entre ton adresse e-mail. Si un compte existe, tu recevras un lien pour choisir un nouveau mot de passe.
      </p>

      <label className="mt-6 block text-sm font-semibold text-stone-600" htmlFor="email">
        Adresse e-mail
      </label>
      <input
        id="email"
        name="email"
        className="mt-2 h-14 w-full rounded-2xl bg-[var(--surface-1)] px-4 outline-none ring-emerald-300 focus:ring-4"
        placeholder="nom@exemple.com"
        type="email"
        autoComplete="email"
        defaultValue={state?.values?.email || ""}
      />
      {state?.errors?.email && <p className="mt-2 text-sm font-semibold text-red-600">{state.errors.email[0]}</p>}

      {state?.message && (
        <p className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          {state.message}
        </p>
      )}

      <button
        className="mt-6 h-14 w-full rounded-2xl bg-emerald-700 px-4 font-bold text-white shadow-cta transition hover:bg-emerald-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        type="submit"
        disabled={pending}
      >
        {pending ? "Envoi..." : "Recevoir le lien"}
      </button>

      <Link className="mt-4 block text-center text-sm font-bold text-emerald-800 transition hover:text-emerald-950 hover:underline" href="/connexion">
        Retour a la connexion
      </Link>
    </form>
  );
}
