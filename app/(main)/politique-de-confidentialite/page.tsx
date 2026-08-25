import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de confidentialité - CycleSmart",
  description:
    "Politique de confidentialité et traitement des données personnelles de CycleSmart.",
};

const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "contact@cyclesmart.app";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <section className="surface-hero p-5 text-white sm:p-6 md:p-7">
        <h1 className="font-display text-2xl font-black tracking-tight sm:text-3xl">
          Politique de confidentialité
        </h1>
        <p className="mt-2 text-sm text-white/75">
          Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")}
        </p>
      </section>

      <section className="surface-card p-5 sm:p-6 md:p-7">
        <div className="prose prose-stone max-w-none text-sm leading-7 text-stone-600">
          <h2 className="text-lg font-bold text-stone-950">1. Responsable du traitement</h2>
          <p>
            Le responsable du traitement est l&apos;éditeur de CycleSmart. Pour toute question relative
            aux données, contacte{" "}
            <a className="font-bold text-emerald-700" href={`mailto:${contactEmail}`}>
              {contactEmail}
            </a>
            .
          </p>

          <h2 className="mt-5 text-lg font-bold text-stone-950">2. Données collectées</h2>
          <p>
            Pour la création d&apos;un compte, nous collectons : nom, adresse e-mail et mot de passe
            (chiffré). Lors de l&apos;utilisation, nous stockons les créneaux, machines et préférences
            que tu choisis d&apos;enregistrer.
          </p>

          <h2 className="mt-5 text-lg font-bold text-stone-950">3. Finalité</h2>
          <p>
            Les données sont utilisées pour fournir le service, synchroniser tes réglages entre
            appareils, et te permettre de récupérer ton compte.
          </p>

          <h2 className="mt-5 text-lg font-bold text-stone-950">4. Base légale</h2>
          <p>
            Le traitement repose sur l&apos;exécution du contrat de service (compte utilisateur) et sur
            les mesures techniques nécessaires au bon fonctionnement de l&apos;application.
          </p>

          <h2 className="mt-5 text-lg font-bold text-stone-950">5. Durée de conservation</h2>
          <p>
            Les comptes et données associées sont conservées tant que le compte est actif. Tu peux
            demander la suppression à tout moment depuis ton profil. Les données sont alors
            anonymisées ou supprimées.
          </p>

          <h2 className="mt-5 text-lg font-bold text-stone-950">6. Vos droits</h2>
          <p>
            Conformément au RGPD, tu disposes des droits d&apos;accès, de rectification, d&apos;effacement,
            de portabilité, de limitation et d&apos;opposition. Pour exercer tes droits, écris-nous à
            l&apos;adresse ci-dessus.
          </p>

          <h2 className="mt-5 text-lg font-bold text-stone-950">7. Hébergement et sécurité</h2>
          <p>
            Les données sont hébergées par un prestataire de confiance. Les mots de passe sont
            hachés et les communications sont sécurisées.
          </p>

          <h2 className="mt-5 text-lg font-bold text-stone-950">8. Cookies et stockage local</h2>
            <p>
            CycleSmart utilise un cookie de session lorsque tu es connecté. En mode invité, les
            données sont stockées localement dans ton navigateur. Aucun cookie publicitaire ou
            traceur tiers n&apos;est utilisé.
          </p>
        </div>
      </section>
    </div>
  );
}
