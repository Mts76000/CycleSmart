import Link from "next/link";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background flex min-h-[100dvh] flex-col">
      <header className="flex items-center justify-between px-6 py-4">
        <Link href="/" className="text-foreground text-sm font-semibold tracking-tight">
          Starter
        </Link>
        <ThemeToggle />
      </header>
      <main id="main-content" className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">{children}</div>
      </main>
    </div>
  );
}
