"use client";

import { useActionState } from "react";
import { changePassword, type AuthFormState } from "@/lib/auth-actions";
import { PasswordInput } from "@/components/password-input";

export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(
    changePassword,
    undefined,
  );

  return (
    <form action={formAction}>
      <label className="block text-sm font-semibold text-stone-600" htmlFor="currentPassword">
        Mot de passe actuel
      </label>
      <PasswordInput id="currentPassword" name="currentPassword" autoComplete="current-password" />
      {state?.errors?.currentPassword && <FormError messages={state.errors.currentPassword} />}
      {state?.errors?.password && <FormError messages={state.errors.password} />}

      <label className="mt-4 block text-sm font-semibold text-stone-600" htmlFor="newPassword">
        Nouveau mot de passe
      </label>
      <PasswordInput id="newPassword" name="newPassword" autoComplete="new-password" />
      {state?.errors?.newPassword && <FormError messages={state.errors.newPassword} />}

      <label className="mt-4 block text-sm font-semibold text-stone-600" htmlFor="confirmPassword">
        Confirmer
      </label>
      <PasswordInput id="confirmPassword" name="confirmPassword" autoComplete="new-password" />
      {state?.errors?.confirmPassword && <FormError messages={state.errors.confirmPassword} />}

      {state?.message && (
        <p
          className={`mt-4 rounded-2xl px-4 py-3 text-sm font-semibold ${
            state.message === "Mot de passe modifie."
              ? "bg-emerald-50 text-emerald-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {state.message}
        </p>
      )}

      <button
        className="mt-5 h-12 w-full rounded-2xl bg-emerald-500 px-4 font-bold text-white shadow-cta transition hover:bg-emerald-600 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        type="submit"
        disabled={pending}
      >
        {pending ? "Modification..." : "Modifier le mot de passe"}
      </button>
    </form>
  );
}

function FormError({ messages }: { messages: string[] }) {
  return <p className="mt-2 text-sm font-semibold text-red-600">{messages[0]}</p>;
}
