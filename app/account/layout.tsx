import Link from "next/link";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background flex min-h-[100dvh] flex-col">
      <header className="border-border flex items-center justify-between border-b px-6 py-4">
        <Link href="/" className="text-foreground text-sm font-semibold tracking-tight">
          Starter
        </Link>
        <ThemeToggle />
      </header>
      <main id="main-content" className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
        {children}
      </main>
    </div>
  );
}
