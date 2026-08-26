"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Footer } from "./footer";
import { Button } from "@/components/ui/button";
import { CalendarIcon, ClockIcon, DeviceIcon, LogoutIcon, UserIcon } from "./icons";
import { PwaInstallPrompt } from "./pwa-install-prompt";
import { authClient } from "@/lib/auth-client";
import { CycleLoading } from "./cycle-loading";
import { SyncErrorBanner } from "./sync-error";
import { CycleProvider, useCycle } from "@/lib/cycle-store";

// Experiment: false tries a plain top-nav header (like the starter-nextjs template) instead
// of the left rail on desktop. Flip back to true to restore the rail — nothing else to
// change, every other layout branch below already reacts to this flag.
const USE_SIDEBAR = false;

const tabs = [
  { href: "/calculer", label: "Calculer", icon: ClockIcon },
  { href: "/creneaux", label: "Creneaux", icon: CalendarIcon },
  { href: "/machines", label: "Machines", icon: DeviceIcon },
  { href: "/profil", label: "Profil", icon: UserIcon },
];

function CycleGuard({ children }: { children: React.ReactNode }) {
  const { hydrated } = useCycle();

  if (!hydrated) {
    return <CycleLoading />;
  }

  return (
    <>
      <SyncErrorBanner />
      {children}
    </>
  );
}

export function MainShell({
  children,
  isAuthenticated,
}: {
  children: React.ReactNode;
  isAuthenticated: boolean;
}) {
  const pathname = usePathname();
  const showSidebar = isAuthenticated && USE_SIDEBAR;

  return (
    <CycleProvider isAuthenticated={isAuthenticated}>
      <main className="bg-cycle-background min-h-dvh text-stone-950">
        <div
          className={`mx-auto flex min-h-dvh w-full flex-col md:p-5 ${
            showSidebar
              ? "max-w-[1400px] md:grid md:grid-cols-[92px_minmax(0,1fr)] md:gap-5 lg:grid-cols-[240px_minmax(0,1fr)]"
              : "max-w-[1400px]"
          }`}
        >
          {showSidebar && <DesktopRail pathname={pathname} />}

          <div className="flex min-h-dvh flex-col md:min-h-0">
            <TopBar isAuthenticated={isAuthenticated} pathname={pathname} />

            <section
              className={`mx-auto w-full max-w-6xl flex-1 px-4 pt-4 pb-8 sm:px-6 md:pt-0 md:pb-10 ${
                isAuthenticated ? "pb-28 md:px-0" : "md:px-8"
              }`}
            >
              <CycleGuard>{children}</CycleGuard>
            </section>

            <div className="mx-auto w-full max-w-6xl px-4 pb-8 sm:px-6 md:px-8">
              <Footer />
            </div>
          </div>

          {isAuthenticated && !USE_SIDEBAR && <MobileDock pathname={pathname} />}
        </div>
      </main>
      {isAuthenticated && <PwaInstallPrompt />}
    </CycleProvider>
  );
}

export function TopBar({
  isAuthenticated,
  pathname,
}: {
  isAuthenticated: boolean;
  pathname?: string;
}) {
  return (
    <header className="border-border bg-background border-b px-4 py-4 sm:px-6 md:px-8">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6">
        <div className="flex items-center gap-8">
          <Link href="/calculer" className="text-foreground text-sm font-semibold tracking-tight">
            CycleSmart
          </Link>

          {isAuthenticated && !USE_SIDEBAR && (
            <nav className="hidden items-center gap-6 md:flex">
              {tabs.map((tab) => (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`text-sm font-medium transition ${
                    pathname === tab.href
                      ? "text-foreground font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </Link>
              ))}
            </nav>
          )}
        </div>

        {!isAuthenticated && (
          <div className="flex gap-3">
            <Link href="/connexion">
              <Button type="button" variant="secondary">
                Se connecter
              </Button>
            </Link>
            <Link href="/inscription">
              <Button type="button">Créer un compte</Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}

function DesktopRail({ pathname }: { pathname: string }) {
  const router = useRouter();

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/connexion");
    router.refresh();
  }

  return (
    <aside className="sticky top-5 hidden h-[calc(100dvh-2.5rem)] flex-col md:flex">
      <div className="surface-card flex flex-1 flex-col p-3 lg:p-5">
        <Link className="flex items-center gap-3 px-1 py-2 lg:px-2" href="/calculer">
          <Image
            alt="CycleSmart"
            className="size-10 shrink-0"
            height={40}
            priority
            src="/logo-icon.png"
            width={40}
          />
          <span className="hidden text-xl font-bold tracking-tight text-emerald-800 lg:inline">
            CycleSmart
          </span>
        </Link>

        <div className="mt-5 rounded-[var(--cycle-radius-md)] bg-emerald-800 p-3 text-white lg:mt-6 lg:p-4">
          <p className="hidden text-[11px] font-bold tracking-[0.14em] text-emerald-100/70 uppercase lg:block">
            Il est
          </p>
          <ClockIcon className="mx-auto size-5 text-emerald-200 lg:hidden" />
          <LiveClockValue />
        </div>

        <nav className="mt-5 flex flex-1 flex-col gap-1.5 lg:mt-6">
          {tabs.map((tab) => (
            <RailItem
              active={pathname === tab.href}
              href={tab.href}
              icon={tab.icon}
              key={tab.href}
              label={tab.label}
            />
          ))}
        </nav>

        <div className="mt-auto hidden lg:block">
          <button
            className="group flex w-full items-center gap-3 rounded-2xl px-2.5 py-2.5 text-sm font-bold text-stone-600 transition hover:bg-stone-50 hover:text-stone-700 lg:px-3.5 lg:py-3"
            type="button"
            onClick={() => void handleSignOut()}
          >
            <LogoutIcon className="size-5 shrink-0" />
            <span className="hidden lg:inline">Déconnexion</span>
          </button>
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
        active
          ? "bg-emerald-50 text-emerald-800"
          : "text-stone-600 hover:bg-stone-50 hover:text-stone-700"
      }`}
      href={href}
    >
      <span
        className={`absolute top-1/2 left-0 h-6 w-1 -translate-y-1/2 rounded-r-full bg-emerald-700 transition-transform ${
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
    <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full pt-2 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] md:hidden">
      <div className="surface-card mx-auto flex max-w-[420px] items-end justify-between px-3 pt-3 pb-2">
        {tabs.map((tab) => (
          <DockItem
            active={pathname === tab.href}
            href={tab.href}
            icon={tab.icon}
            key={tab.href}
            label={tab.label}
          />
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
        className={`grid place-items-center rounded-full transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          active
            ? "shadow-cta size-12 -translate-y-4 bg-emerald-700 text-white"
            : "size-9 translate-y-0 text-stone-600"
        }`}
      >
        <Icon className="size-5" />
      </span>
      <span
        className={`text-[10px] font-bold transition-opacity ${
          active ? "-mt-3 text-emerald-700 opacity-100" : "text-stone-600"
        }`}
      >
        {label}
      </span>
    </Link>
  );
}
