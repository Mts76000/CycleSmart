"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { saveLocalUser } from "../lib/auth-store";

type AuthMode = "login" | "signup";

export function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const isSignup = mode === "signup";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!email.includes("@")) {
      setError("Entre une adresse e-mail valide.");
      return;
    }

    if (password.length < 6) {
      setError("Le mot de passe doit faire au moins 6 caracteres.");
      return;
    }

    const user = {
      name: isSignup ? name.trim() || "Utilisateur" : email.split("@")[0] || "Utilisateur",
      email: email.trim().toLowerCase(),
    };

    try {
      const response = await fetch("/api/auth/upsert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });
      const data = (await response.json()) as { ok?: boolean; error?: string };

      if (!data.ok) {
        setError(data.error || "Connexion PostgreSQL indisponible.");
        return;
      }
    } catch {
      setError("Connexion PostgreSQL indisponible.");
      return;
    }

    saveLocalUser(user);
    router.push("/profil");
  }

  return (
    <form className="mt-8 rounded-[32px] bg-white p-6 shadow-xl shadow-slate-200/80" onSubmit={handleSubmit}>
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
            className="mt-2 h-14 w-full rounded-2xl bg-slate-100 px-4 outline-none ring-cyan-300 focus:ring-4"
            placeholder="Marc Dupont"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </>
      )}

      <label className={`${isSignup ? "mt-4" : "mt-6"} block text-sm font-semibold text-slate-600`} htmlFor="email">
        Adresse e-mail
      </label>
      <input
        id="email"
        className="mt-2 h-14 w-full rounded-2xl bg-slate-100 px-4 outline-none ring-cyan-300 focus:ring-4"
        placeholder="nom@exemple.com"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />

      <div className="mt-4 flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-600" htmlFor="password">
          Mot de passe
        </label>
        {!isSignup && (
          <button className="text-sm font-semibold text-teal-700" type="button">
            Oublie ?
          </button>
        )}
      </div>
      <input
        id="password"
        className="mt-2 h-14 w-full rounded-2xl bg-slate-100 px-4 outline-none ring-cyan-300 focus:ring-4"
        placeholder="••••••••"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />

      {error && <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}

      <button
        className="mt-6 h-14 w-full rounded-2xl bg-cyan-400 px-4 font-bold text-teal-950 shadow-lg shadow-cyan-300/40 transition active:scale-[0.99]"
        type="submit"
      >
        {isSignup ? "Creer mon compte" : "Me connecter"} →
      </button>

      <p className="mt-5 rounded-full bg-slate-100 px-4 py-3 text-center text-sm text-slate-500">
        Tes creneaux seront synchronises avec PostgreSQL une fois connecte.
      </p>
    </form>
  );
}
