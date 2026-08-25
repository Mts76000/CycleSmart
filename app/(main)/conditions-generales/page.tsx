import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions d'utilisation - CycleSmart",
  description: "Conditions générales d'utilisation de CycleSmart.",
};

const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "contact@mathis-lamotte.fr";

export default function ConditionsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <section className="surface-hero p-5 text-white sm:p-6 md:p-7">
        <h1 className="font-display text-2xl font-black tracking-tight sm:text-3xl">
          Conditions d&apos;utilisation
        </h1>
        <p className="mt-2 text-sm text-emerald-50">
          Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")}
        </p>
      </section>

      <section className="surface-card p-5 sm:p-6 md:p-7">
        <div className="prose prose-stone max-w-none text-sm leading-7 text-stone-600">
          <h2 className="text-lg font-bold text-stone-950">1. Objet</h2>
          <p>
            CycleSmart est un calculateur qui aide à choisir le meilleur moment pour lancer ses
            appareils électroménagers, en fonction des plages d&apos;heures creuses renseignées.
          </p>

          <h2 className="mt-5 text-lg font-bold text-stone-950">2. Accès au service</h2>
          <p>
            Le service est accessible gratuitement. Certaines fonctionnalités, comme la
            synchronisation entre appareils, nécessitent la création d&apos;un compte.
          </p>

          <h2 className="mt-5 text-lg font-bold text-stone-950">3. Responsabilités</h2>
<p>
            CycleSmart fournit une estimation basée sur les informations saisies par l&apos;utilisateur.
            Il ne remplace pas les consignes du fabricant de l&apos;appareil ni la vérification des
            horaires réels de l&apos;abonnement d&apos;électricité.
          </p>

          <h2 className="mt-5 text-lg font-bold text-stone-950">4. Propriété intellectuelle</h2>
          <p>
            L&apos;ensemble du contenu et du code de CycleSmart est protégé. Toute reproduction sans
            autorisation est interdite.
          </p>

          <h2 className="mt-5 text-lg font-bold text-stone-950">5. Modification des conditions</h2>
          <p>
            Les conditions peuvent être mises à jour à tout moment. L&apos;utilisateur est invité à les
            consulter régulièrement.
          </p>

          <h2 className="mt-5 text-lg font-bold text-stone-950">6. Contact</h2>
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
