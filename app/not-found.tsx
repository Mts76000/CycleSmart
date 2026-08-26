import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <main
      id="main-content"
      className="bg-cycle-background flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-center"
    >
      <Image
        alt="CycleSmart"
        className="size-12"
        height={48}
        priority
        src="/logo-icon.png"
        width={48}
      />
      <p className="text-sm font-bold text-emerald-700">404</p>
      <h1 className="font-display text-2xl font-black tracking-tight text-stone-950">
        Page introuvable
      </h1>
      <p className="max-w-sm text-sm text-stone-600">
        La page que tu cherches n&apos;existe pas ou a été déplacée.
      </p>
      <Link
        className="shadow-cta mt-2 flex h-11 items-center justify-center rounded-full bg-emerald-700 px-6 text-sm font-bold text-white transition hover:bg-emerald-800 active:scale-[0.98]"
        href="/calculer"
      >
        Retour à l&apos;accueil
      </Link>
    </main>
  );
}
