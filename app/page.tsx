import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { getOptionalSession } from "@/lib/permissions";

export default async function Home() {
  const session = await getOptionalSession();

  return (
    <div className="bg-background flex min-h-[100dvh] flex-col">
      <header className="flex items-center justify-between px-6 py-4">
        <span className="text-foreground text-sm font-semibold tracking-tight">Starter</span>
        <ThemeToggle />
      </header>
      <main
        id="main-content"
        className="flex flex-1 flex-col items-center justify-center gap-6 px-4 text-center"
      >
        <h1 className="text-foreground text-3xl font-semibold tracking-tight sm:text-4xl">
          Starter Next.js générique
        </h1>
        <p className="text-muted-foreground max-w-md text-sm">
          Auth, email, analytics, sécurité et tests déjà en place. Décrivez vos fonctionnalités
          métier, le reste est prêt.
        </p>
        {session ? (
          <Link href="/account">
            <Button type="button">Mon compte</Button>
          </Link>
        ) : (
          <div className="flex gap-3">
            <Link href="/register">
              <Button type="button">Créer un compte</Button>
            </Link>
            <Link href="/login">
              <Button type="button" variant="secondary">
                Se connecter
              </Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
