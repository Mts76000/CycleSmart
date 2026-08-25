import { LegalLinks } from "./legal-links";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto py-8 text-center">
      <p className="text-xs font-semibold text-stone-600">
        © {currentYear} CycleSmart. Tous droits réservés.
      </p>
      <LegalLinks className="mt-2 justify-center" />
    </footer>
  );
}
