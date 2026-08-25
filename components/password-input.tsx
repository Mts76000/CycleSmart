"use client";

import { useState } from "react";
import { EyeIcon, EyeOffIcon } from "@/components/icons";

type PasswordInputProps = {
  autoComplete: string;
  id: string;
  name: string;
  placeholder?: string;
};

export function PasswordInput({
  autoComplete,
  id,
  name,
  placeholder = "••••••••",
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="mt-2 flex h-14 items-center rounded-[var(--radius-sm)] bg-[var(--surface-1)] px-4 outline-none ring-emerald-300 focus-within:ring-4">
      <input
        id={id}
        name={name}
        className="min-w-0 flex-1 bg-transparent outline-none"
        placeholder={placeholder}
        type={visible ? "text" : "password"}
        autoComplete={autoComplete}
      />
      <button
        className="ml-3 grid size-9 shrink-0 place-items-center rounded-xl text-stone-600 transition hover:bg-white hover:text-emerald-700"
        type="button"
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
      >
        {visible ? <EyeOffIcon className="size-5" /> : <EyeIcon className="size-5" />}
      </button>
    </div>
  );
}
