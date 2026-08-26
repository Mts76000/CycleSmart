export default function PrivacyPolicyPage() {
  return (
    <main id="main-content" className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-foreground text-2xl font-semibold tracking-tight">
        Politique de confidentialité
      </h1>
      <div className="text-muted-foreground mt-6 flex flex-col gap-4 text-sm">
        <p>
          Contenu à personnaliser projet par projet. Ce placeholder couvre les services utilisés par
          le starter :
        </p>
        <ul className="list-disc pl-5">
          <li>
            <strong className="text-foreground">Session (better-auth)</strong> : cookie strictement
            nécessaire au fonctionnement du service (authentification). Aucun bandeau de
            consentement n&apos;est requis pour ce cookie.
          </li>
          <li>
            <strong className="text-foreground">Umami</strong> : analytics respectueux de la vie
            privée, sans cookie ni donnée personnelle identifiable, actif uniquement en production.
          </li>
          <li>
            <strong className="text-foreground">Resend</strong> : envoi des emails transactionnels
            (vérification de compte, réinitialisation de mot de passe, notifications).
          </li>
          <li>
            <strong className="text-foreground">Cloudflare Turnstile</strong> : protection anti-bot
            du formulaire d&apos;inscription.
          </li>
        </ul>
        <p>
          Conformément au RGPD, vous pouvez exporter ou supprimer vos données depuis la page{" "}
          <a href="/account" className="text-primary font-medium hover:underline">
            Paramètres du compte
          </a>
          .
        </p>
      </div>
    </main>
  );
}
