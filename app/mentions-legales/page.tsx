export default function LegalNoticePage() {
  return (
    <main id="main-content" className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-foreground text-2xl font-semibold tracking-tight">Mentions légales</h1>
      <div className="text-muted-foreground mt-6 flex flex-col gap-4 text-sm">
        <p>
          Contenu à personnaliser projet par projet : éditeur du site, forme juridique, siège
          social, numéro d&apos;immatriculation, directeur de publication, hébergeur.
        </p>
        <p>
          Contact : voir l&apos;adresse configurée dans <code>CONTACT_EMAIL</code>.
        </p>
      </div>
    </main>
  );
}
