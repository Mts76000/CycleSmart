import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique cookies - CycleSmart",
  description: "Information sur les cookies et le stockage local utilisés par CycleSmart.",
};

const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "contact@mathis-lamotte.fr";

export default function CookiesPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <section className="surface-hero p-5 text-white sm:p-6 md:p-7">
        <h1 className="font-display text-2xl font-black tracking-tight sm:text-3xl">
          Cookies et stockage local
        </h1>
        <p className="mt-2 text-sm text-emerald-50">
          Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")}
        </p>
      </section>

      <section className="surface-card p-5 sm:p-6 md:p-7">
        <div className="prose prose-stone max-w-none text-sm leading-7 text-stone-600">
          <h2 className="text-lg font-bold text-stone-950">1. Cookie de session</h2>
          <p>
            Un cookie technique contenant un identifiant de session est déposé lorsque tu te
            connectes. Il est strictement nécessaire à l&apos;authentification et expire à la fermeture
            de la session.
          </p>

          <h2 className="mt-5 text-lg font-bold text-stone-950">2. Stockage local</h2>
          <p>
            En mode invité, CycleSmart utilise le stockage local de ton navigateur pour conserver tes
            créneaux et réglages sans compte. Ces données restent sur ton appareil.
          </p>

          <h2 className="mt-5 text-lg font-bold text-stone-950">3. Aucun traceur tiers</h2>
          <p>
            CycleSmart n&apos;utilise pas de cookies publicitaires, de réseaux sociaux ou de statistiques
            tiers.
          </p>

          <h2 className="mt-5 text-lg font-bold text-stone-950">4. Gestion des préférences</h2>
          <p>
            Tu peux vider le stockage local depuis les paramètres de ton navigateur. La suppression
            du compte efface les données synchronisées côté serveur.
          </p>

          <h2 className="mt-5 text-lg font-bold text-stone-950">5. Contact</h2>
          <p>
            Pour toute question, écris-nous à{" "}
            <a className="font-bold text-emerald-700" href={`mailto:${contactEmail}`}>
              {contactEmail}
            </a>
            .
          </p>
        </div>
      </section>
    </div>
  );
}
