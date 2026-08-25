import Link from "next/link";

export function LegalLinks({ className = "" }: { className?: string }) {
  return (
    <nav className={`flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold text-stone-600 ${className}`}>
      <Link className="transition hover:text-emerald-700" href="/conditions-generales">
        Conditions d&apos;utilisation
      </Link>
      <Link className="transition hover:text-emerald-700" href="/politique-de-confidentialite">
        Confidentialité
      </Link>
      <Link className="transition hover:text-emerald-700" href="/cookies">
        Cookies
      </Link>
    </nav>
  );
}
