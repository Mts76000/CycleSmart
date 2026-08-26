import { LegalLinks } from "./legal-links";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-emerald-900/10 px-4 py-6 sm:px-6 md:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 sm:flex-row">
        <p className="text-xs font-semibold text-stone-600">
          © {currentYear} CycleSmart. Tous droits réservés.
        </p>
        <LegalLinks />
      </div>
    </footer>
  );
}
