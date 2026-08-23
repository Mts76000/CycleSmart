"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, signup, type AuthFormState } from "@/lib/auth-actions";
import { PasswordInput } from "@/components/password-input";

type AuthMode = "login" | "signup";

export function AuthForm({ mode }: { mode: AuthMode }) {
  const isSignup = mode === "signup";
  const action = isSignup ? signup : login;
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(
    action,
    undefined,
  );

  return (
    <form
      className="surface-card mt-8 p-6"
      action={formAction}
    >
      <div className="grid grid-cols-2 gap-1 rounded-[var(--radius-sm)] bg-[var(--surface-1)] p-1">
        {isSignup ? (
          <Link
            className="rounded-xl px-3 py-3 text-center font-semibold text-stone-500 transition hover:text-stone-800"
            href="/connexion"
          >
            Connexion
          </Link>
        ) : (
          <span className="rounded-xl bg-white px-3 py-3 text-center font-semibold text-stone-950 shadow-sm">
            Connexion
          </span>
        )}
        {isSignup ? (
          <span className="rounded-xl bg-white px-3 py-3 text-center font-semibold text-stone-950 shadow-sm">
            Inscription
          </span>
        ) : (
          <Link
            className="rounded-xl px-3 py-3 text-center font-semibold text-stone-500 transition hover:text-stone-800"
            href="/inscription"
          >
            Inscription
          </Link>
        )}
      </div>

      {isSignup && (
        <>
          <label
            className="mt-6 block text-sm font-semibold text-stone-600"
            htmlFor="name"
          >
            Nom
          </label>
          <input
            id="name"
            name="name"
            className="mt-2 h-14 w-full rounded-2xl bg-[var(--surface-1)] px-4 outline-none ring-emerald-300 focus:ring-4"
            placeholder="Marc Dupont"
            type="text"
            autoComplete="name"
            defaultValue={state?.values?.name || ""}
          />
          {state?.errors?.name && <FormError messages={state.errors.name} />}
        </>
      )}

      <label
        className={`${isSignup ? "mt-4" : "mt-6"} block text-sm font-semibold text-stone-600`}
        htmlFor="email"
      >
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
      {state?.errors?.email && <FormError messages={state.errors.email} />}

      <label
        className="mt-4 block text-sm font-semibold text-stone-600"
        htmlFor="password"
      >
        Mot de passe
      </label>
      <PasswordInput
        id="password"
        name="password"
        autoComplete={isSignup ? "new-password" : "current-password"}
      />
      {state?.errors?.password && (
        <FormError messages={state.errors.password} />
      )}

      {!isSignup && (
        <>
          <div className="mt-4 flex items-center justify-between gap-3 flex-col">
            <label className="flex flex-1 items-center gap-3 rounded-2xl bg-[var(--surface-1)] px-4 py-3 text-sm font-semibold text-stone-600">
              <input
                className="size-4 accent-emerald-600"
                type="checkbox"
                name="remember"
                value="yes"
              />
              Rester connecte plus longtemps
            </label>
            <Link
              className="text-sm font-bold text-emerald-800 transition hover:text-emerald-950 hover:underline"
              href="/mot-de-passe-oublie"
            >
              Mot de passe oublie ?
            </Link>
          </div>
        </>
      )}

      {state?.message && (
        <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {state.message}
        </p>
      )}

      <button
        className="mt-6 h-14 w-full rounded-2xl bg-emerald-500 px-4 font-bold text-white shadow-cta transition hover:bg-emerald-600 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        type="submit"
        disabled={pending}
      >
        {pending
          ? "Verification..."
          : isSignup
            ? "Creer mon compte →"
            : "Me connecter →"}
      </button>
    </form>
  );
}

function FormError({ messages }: { messages: string[] }) {
  return (
    <p className="mt-2 text-sm font-semibold text-red-600">{messages[0]}</p>
  );
}
