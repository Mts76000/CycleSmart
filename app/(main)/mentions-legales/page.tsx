import type { Metadata } from "next";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  title: "Mentions légales - CycleSmart",
  description: "Mentions légales de CycleSmart.",
};

export default function LegalNoticePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <section className="surface-hero p-5 text-white sm:p-6 md:p-7">
        <h1 className="font-display text-2xl font-black tracking-tight sm:text-3xl">
          Mentions légales
        </h1>
        <p className="mt-2 text-sm text-emerald-50">
          Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")}
        </p>
      </section>

      <section className="surface-card p-5 sm:p-6 md:p-7">
        <div className="prose prose-stone max-w-none text-sm leading-7 text-stone-600">
          <h2 className="text-lg font-bold text-stone-950">1. Éditeur du site</h2>
          <p>Le site CycleSmart ({env.NEXT_PUBLIC_APP_URL}) est édité par :</p>
          <ul>
            <li>Mathis Lamotte</li>
            <li>Statut juridique en cours de formalisation (entreprise individuelle)</li>
            <li>Numéro SIRET en cours d&apos;attribution</li>
            <li>
              Contact :{" "}
              <a className="font-bold text-emerald-700" href={`mailto:${env.CONTACT_EMAIL}`}>
                {env.CONTACT_EMAIL}
              </a>
            </li>
          </ul>

          <h2 className="mt-5 text-lg font-bold text-stone-950">2. Directeur de la publication</h2>
          <p>Mathis Lamotte.</p>

          <h2 className="mt-5 text-lg font-bold text-stone-950">3. Hébergement</h2>
          <p>
            Le site est hébergé par Hostinger (Hostinger International Ltd.) —{" "}
            <a
              className="font-bold text-emerald-700"
              href="https://www.hostinger.fr"
              target="_blank"
              rel="noopener noreferrer"
            >
              hostinger.fr
            </a>
            .
          </p>

          <h2 className="mt-5 text-lg font-bold text-stone-950">4. Propriété intellectuelle</h2>
          <p>
            L&apos;ensemble des contenus présents sur CycleSmart (textes, images, logos, structure,
            code) est protégé par le droit de la propriété intellectuelle. Toute reproduction ou
            représentation, totale ou partielle, sans autorisation préalable, est interdite.
          </p>

          <h2 className="mt-5 text-lg font-bold text-stone-950">5. Contact</h2>
          <p>
            Pour toute question relative à ces mentions légales, écris-nous à{" "}
            <a className="font-bold text-emerald-700" href={`mailto:${env.CONTACT_EMAIL}`}>
              {env.CONTACT_EMAIL}
            </a>
            .
          </p>
        </div>
      </section>
    </div>
  );
}
