"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarIcon, ClockIcon, DeviceIcon, UserIcon } from "./icons";
import { PwaInstallPrompt } from "./pwa-install-prompt";
import { CycleProvider, useCycle } from "@/lib/cycle-store";

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
      <main className="min-h-dvh bg-[#eef2f1] text-slate-950">
        <div
          className={`mx-auto flex min-h-dvh w-full flex-col md:p-5 ${
            isAuthenticated ? "max-w-[1400px] md:grid md:grid-cols-[92px_minmax(0,1fr)] md:gap-5 lg:grid-cols-[240px_minmax(0,1fr)]" : "max-w-4xl"
          }`}
        >
          {isAuthenticated && <DesktopRail pathname={pathname} />}

          <div className="flex min-h-dvh flex-col md:min-h-0">
            <TopBar isAuthenticated={isAuthenticated} />

            <section
              className={`mx-auto w-full flex-1 px-4 pt-4 sm:px-6 md:px-0 md:pt-0 ${
                isAuthenticated ? "max-w-5xl pb-28 md:pb-10" : "max-w-3xl pb-8"
              }`}
            >
              {children}
            </section>
          </div>

          {isAuthenticated && <MobileDock pathname={pathname} />}
        </div>
      </main>
      {isAuthenticated && <PwaInstallPrompt />}
    </CycleProvider>
  );
}

function TopBar({ isAuthenticated }: { isAuthenticated: boolean }) {
  if (!isAuthenticated) {
    return (
      <header className="px-5 pb-4 pt-6 sm:px-0">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <BrandMark />
          <div className="flex gap-2">
            <Link
              className="flex-1 rounded-full bg-emerald-500 px-4 py-2.5 text-center text-sm font-bold text-white shadow-cta transition hover:bg-emerald-600 active:scale-[0.98] sm:flex-none"
              href="/connexion"
            >
              Connexion
            </Link>
            <Link
              className="flex-1 rounded-full bg-white px-4 py-2.5 text-center text-sm font-bold text-emerald-700 shadow-sm transition hover:bg-emerald-50 active:scale-[0.98] sm:flex-none"
              href="/inscription"
            >
              Creer un compte
            </Link>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="flex items-center justify-between gap-3 px-5 pb-3 pt-5 sm:px-0 md:hidden">
      <BrandMark compact />
      <LiveClockChip />
    </header>
  );
}

function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <Link className="flex items-center gap-2.5" href="/calculer">
      <Image alt="CycleSmart" className="size-9" height={36} priority src="/logo-icon.png" width={36} />
      {!compact && (
        <span className="text-xl font-bold tracking-tight text-emerald-800">CycleSmart</span>
      )}
    </Link>
  );
}

function LiveClockChip() {
  const { currentTime } = useCycle();

  return (
    <div className="flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-sm font-bold text-emerald-800 shadow-sm">
      <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
      {currentTime}
    </div>
  );
}

function DesktopRail({ pathname }: { pathname: string }) {
  return (
    <aside className="sticky top-5 hidden h-[calc(100dvh-2.5rem)] flex-col md:flex">
      <div className="flex flex-1 flex-col rounded-[28px] bg-white p-3 shadow-card lg:p-5">
        <Link className="flex items-center gap-3 px-1 py-2 lg:px-2" href="/calculer">
          <Image alt="CycleSmart" className="size-10 shrink-0" height={40} priority src="/logo-icon.png" width={40} />
          <span className="hidden text-xl font-bold tracking-tight text-emerald-800 lg:inline">
            CycleSmart
          </span>
        </Link>

        <div className="mt-5 rounded-2xl bg-emerald-800 p-3 text-white lg:mt-6 lg:p-4">
          <p className="hidden text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-100/70 lg:block">
            Il est
          </p>
          <ClockIcon className="mx-auto size-5 text-emerald-200 lg:hidden" />
          <LiveClockValue />
        </div>

        <nav className="mt-5 flex flex-1 flex-col gap-1.5 lg:mt-6">
          {tabs.map((tab) => (
            <RailItem active={pathname === tab.href} href={tab.href} icon={tab.icon} key={tab.href} label={tab.label} />
          ))}
        </nav>

        <div className="hidden rounded-2xl bg-emerald-50 p-4 text-sm leading-6 text-emerald-900 lg:block">
          <p className="font-bold">Astuce</p>
          <p className="mt-1 text-emerald-800/75">
            Configure tes heures creuses une fois, puis laisse CycleSmart choisir le bon moment.
          </p>
        </div>
      </div>
    </aside>
  );
}

function LiveClockValue() {
  const { currentTime, todayLabel } = useCycle();

  return (
    <div className="text-center lg:text-left">
      <p className="font-display mt-1 text-2xl font-bold tracking-tight lg:mt-0.5">{currentTime}</p>
      {todayLabel && (
        <p className="hidden text-xs font-semibold text-emerald-100/70 lg:block">{todayLabel}</p>
      )}
    </div>
  );
}

function RailItem({
  active,
  href,
  icon: Icon,
  label,
}: {
  active: boolean;
  href: string;
  icon: (props: { className?: string }) => React.ReactNode;
  label: string;
}) {
  return (
    <Link
      className={`group relative flex items-center gap-3 rounded-2xl px-2.5 py-2.5 transition lg:px-3.5 lg:py-3 ${
        active ? "bg-emerald-50 text-emerald-800" : "text-slate-400 hover:bg-slate-50 hover:text-slate-700"
      }`}
      href={href}
    >
      <span
        className={`absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-emerald-500 transition-transform ${
          active ? "scale-y-100" : "scale-y-0"
        }`}
        aria-hidden="true"
      />
      <Icon className="size-5 shrink-0" />
      <span className="hidden truncate text-sm font-bold lg:inline">{label}</span>
    </Link>
  );
}

function MobileDock({ pathname }: { pathname: string }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-2 md:hidden">
      <div className="mx-auto flex max-w-[420px] items-end justify-between rounded-[28px] bg-white px-3 pb-2 pt-3 shadow-card">
        {tabs.map((tab) => (
          <DockItem active={pathname === tab.href} href={tab.href} icon={tab.icon} key={tab.href} label={tab.label} />
        ))}
      </div>
    </nav>
  );
}

function DockItem({
  active,
  href,
  icon: Icon,
  label,
}: {
  active: boolean;
  href: string;
  icon: (props: { className?: string }) => React.ReactNode;
  label: string;
}) {
  return (
    <Link className="flex flex-1 flex-col items-center gap-1" href={href}>
      <span
        className={`grid place-items-center rounded-full transition-all duration-200 ${
          active
            ? "size-12 -translate-y-4 bg-emerald-500 text-white shadow-cta"
            : "size-9 translate-y-0 text-slate-400"
        }`}
      >
        <Icon className={active ? "size-5" : "size-5"} />
      </span>
      <span
        className={`text-[10px] font-bold transition-opacity ${
          active ? "-mt-3 text-emerald-700 opacity-100" : "text-slate-400 opacity-80"
        }`}
      >
        {label}
      </span>
    </Link>
  );
}
