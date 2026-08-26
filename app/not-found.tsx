import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main
      id="main-content"
      className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 px-4 text-center"
    >
      <p className="text-primary text-sm font-medium">404</p>
      <h1 className="text-foreground text-2xl font-semibold tracking-tight">Page introuvable</h1>
      <p className="text-muted-foreground max-w-sm text-sm">
        La page que vous cherchez n&apos;existe pas ou a été déplacée.
      </p>
      <Link href="/">
        <Button type="button">Retour à l&apos;accueil</Button>
      </Link>
    </main>
  );
}
