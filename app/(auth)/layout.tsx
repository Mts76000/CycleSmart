import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-cycle-background flex min-h-dvh flex-col">
      <header className="flex items-center px-6 py-4 sm:px-8">
        <Link className="flex items-center gap-2.5" href="/calculer">
          <Image
            alt="CycleSmart"
            className="size-10"
            height={40}
            priority
            src="/logo-icon.png"
            width={40}
          />
          <span className="text-xl font-bold tracking-tight text-emerald-800">CycleSmart</span>
        </Link>
      </header>
      <main id="main-content" className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">{children}</div>
      </main>
    </div>
  );
}
