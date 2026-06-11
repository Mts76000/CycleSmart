"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, signup, type AuthFormState } from "@/lib/auth-actions";

type AuthMode = "login" | "signup";

export function AuthForm({ mode }: { mode: AuthMode }) {
  const isSignup = mode === "signup";
  const action = isSignup ? signup : login;
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(action, undefined);

  return (
    <form className="mt-8 rounded-[32px] bg-white p-6 shadow-xl shadow-slate-200/80" action={formAction}>
      <div className="grid grid-cols-2 gap-1 rounded-2xl bg-slate-100 p-1">
        {isSignup ? (
          <Link className="rounded-xl px-3 py-3 text-center font-semibold text-slate-500" href="/connexion">
            Connexion
          </Link>
        ) : (
          <span className="rounded-xl bg-white px-3 py-3 text-center font-semibold text-slate-950 shadow-sm">
            Connexion
          </span>
        )}
        {isSignup ? (
          <span className="rounded-xl bg-white px-3 py-3 text-center font-semibold text-slate-950 shadow-sm">
            Inscription
          </span>
        ) : (
          <Link className="rounded-xl px-3 py-3 text-center font-semibold text-slate-500" href="/inscription">
            Inscription
          </Link>
        )}
      </div>

      {isSignup && (
        <>
          <label className="mt-6 block text-sm font-semibold text-slate-600" htmlFor="name">
            Nom
          </label>
          <input
            id="name"
            name="name"
            className="mt-2 h-14 w-full rounded-2xl bg-slate-100 px-4 outline-none ring-emerald-300 focus:ring-4"
            placeholder="Marc Dupont"
            type="text"
            autoComplete="name"
            defaultValue={state?.values?.name || ""}
          />
          {state?.errors?.name && <FormError messages={state.errors.name} />}
        </>
      )}

      <label className={`${isSignup ? "mt-4" : "mt-6"} block text-sm font-semibold text-slate-600`} htmlFor="email">
        Adresse e-mail
      </label>
      <input
        id="email"
        name="email"
        className="mt-2 h-14 w-full rounded-2xl bg-slate-100 px-4 outline-none ring-emerald-300 focus:ring-4"
        placeholder="nom@exemple.com"
        type="email"
        autoComplete="email"
        defaultValue={state?.values?.email || ""}
      />
      {state?.errors?.email && <FormError messages={state.errors.email} />}

      <label className="mt-4 block text-sm font-semibold text-slate-600" htmlFor="password">
        Mot de passe
      </label>
      <input
        id="password"
        name="password"
        className="mt-2 h-14 w-full rounded-2xl bg-slate-100 px-4 outline-none ring-emerald-300 focus:ring-4"
        placeholder="••••••••"
        type="password"
        autoComplete={isSignup ? "new-password" : "current-password"}
      />
      {state?.errors?.password && <FormError messages={state.errors.password} />}
      {state?.message && (
        <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {state.message}
        </p>
      )}

      <button
        className="mt-6 h-14 w-full rounded-2xl bg-emerald-500 px-4 font-bold text-white shadow-lg shadow-emerald-300/40 transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        type="submit"
        disabled={pending}
      >
        {pending ? "Verification..." : isSignup ? "Creer mon compte →" : "Me connecter →"}
      </button>

      <p className="mt-5 rounded-full bg-slate-100 px-4 py-3 text-center text-sm text-slate-500">
        Connexion securisee par cookie httpOnly et mot de passe chiffre en base.
      </p>
    </form>
  );
}

function FormError({ messages }: { messages: string[] }) {
  return <p className="mt-2 text-sm font-semibold text-red-600">{messages[0]}</p>;
}
