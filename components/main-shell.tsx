"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarIcon, ClockIcon, DeviceIcon, UserIcon } from "./icons";
import { BuyMeACoffeeButton } from "./buy-me-a-coffee-button";
import { CycleProvider } from "@/lib/cycle-store";

const tabs = [
  { href: "/calculer", label: "Calculer", icon: ClockIcon },
  { href: "/creneaux", label: "Creneaux", icon: CalendarIcon },
  { href: "/machines", label: "Machines", icon: DeviceIcon },
  { href: "/profil", label: "Profil", icon: UserIcon },
];

export function MainShell({
  children,
  isAuthenticated,
}: {
  children: React.ReactNode;
  isAuthenticated: boolean;
}) {
  const pathname = usePathname();

  return (
    <CycleProvider isAuthenticated={isAuthenticated}>
      <main className="min-h-dvh bg-[#f5f7f7] text-slate-950">
        <div
          className={`mx-auto flex min-h-dvh w-full flex-col bg-[#f8faf9] shadow-2xl shadow-slate-300/30 md:bg-transparent md:p-6 md:shadow-none ${
            isAuthenticated
              ? "max-w-7xl md:grid md:grid-cols-[260px_minmax(0,1fr)]"
              : "max-w-4xl"
          }`}
        >
          {isAuthenticated && (
            <aside className="hidden rounded-[28px] bg-white p-5 shadow-xl shadow-slate-200/70 md:sticky md:top-6 md:flex md:h-[calc(100dvh-3rem)] md:flex-col">
              <Brand />
              <nav className="mt-8 grid gap-2">
                {tabs.map((tab) => (
                  <NavItem
                    active={pathname === tab.href}
                    href={tab.href}
                    icon={tab.icon}
                    key={tab.href}
                    label={tab.label}
                  />
                ))}
              </nav>
              <div className="mt-auto rounded-3xl bg-green-50 p-4 text-sm leading-6 text-emerald-900">
                <p className="font-bold">Heures creuses</p>
                <p className="mt-1 text-emerald-800/75">
                  Configure tes creneaux une fois, puis lance tes cycles au bon moment.
                </p>
              </div>
            </aside>
          )}

          <div className={`flex min-h-dvh flex-col md:min-h-0 ${isAuthenticated ? "md:px-8" : ""}`}>
            <header className="sticky top-0 z-20 bg-[#f8faf9]/95 px-6 pb-4 pt-5 backdrop-blur md:static md:bg-transparent md:px-0 md:pb-6 md:pt-1">
              <div className={isAuthenticated ? "md:hidden" : ""}>
                <Brand />
                {!isAuthenticated && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link
                      className="rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-bold text-white"
                      href="/connexion"
                    >
                      Connexion
                    </Link>
                    <Link
                      className="rounded-2xl bg-white px-4 py-2 text-sm font-bold text-emerald-700 shadow-sm"
                      href="/inscription"
                    >
                      Creer un compte
                    </Link>
                  </div>
                )}
              </div>
              {isAuthenticated && (
                <div className="hidden md:block">
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-700">
                    CycleSmart
                  </p>
                  <h1 className="mt-2 text-4xl font-black tracking-normal text-slate-950">
                    Optimisation des cycles
                  </h1>
                </div>
              )}
            </header>

            <section
              className={`mx-auto w-full flex-1 px-5 md:px-0 md:pb-8 ${
                isAuthenticated ? "max-w-5xl pb-28" : "max-w-3xl pb-8"
              }`}
            >
              {children}
              <BuyMeACoffeeButton />
            </section>
          </div>

          {isAuthenticated && (
            <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full bg-white/95 px-3 py-3 shadow-[0_-12px_30px_rgba(15,23,42,0.08)] backdrop-blur md:hidden">
              <div className="mx-auto grid max-w-[430px] grid-cols-4 gap-1 rounded-[24px] bg-slate-100 p-1">
                {tabs.map((tab) => (
                  <NavItem
                    active={pathname === tab.href}
                    compact
                    href={tab.href}
                    icon={tab.icon}
                    key={tab.href}
                    label={tab.label}
                  />
                ))}
              </div>
            </nav>
          )}
        </div>
      </main>
    </CycleProvider>
  );
}

function Brand() {
  return (
    <Link className="flex items-center gap-3" href="/calculer">
      <Image alt="CycleSmart" className="size-10" height={40} priority src="/logo-icon.png" width={40} />
      <span className="text-2xl font-bold tracking-normal text-emerald-700">CycleSmart</span>
    </Link>
  );
}

function NavItem({
  active,
  compact = false,
  href,
  icon: Icon,
  label,
}: {
  active: boolean;
  compact?: boolean;
  href: string;
  icon: (props: { className?: string }) => React.ReactNode;
  label: string;
}) {
  return (
    <Link
      className={`flex rounded-[20px] font-bold transition ${
        compact
          ? "h-14 flex-col items-center justify-center gap-1 text-[11px]"
          : "h-12 items-center justify-start gap-2 px-4 text-sm"
      } ${active ? "bg-emerald-500 text-white shadow-sm" : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"}`}
      href={href}
    >
      <Icon className={compact ? "size-5 shrink-0" : "size-5"} />
      <span className={compact ? "leading-none" : undefined}>{label}</span>
    </Link>
  );
}
