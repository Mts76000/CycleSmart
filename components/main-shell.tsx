"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarIcon, ClockIcon, UserIcon } from "./icons";
import { CycleProvider } from "../lib/cycle-store";

const tabs = [
  { href: "/calculer", label: "Calculer", icon: ClockIcon },
  { href: "/creneaux", label: "Creneaux", icon: CalendarIcon },
  { href: "/profil", label: "Profil", icon: UserIcon },
];

export function MainShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <CycleProvider>
      <main className="min-h-dvh bg-[#eef3f2] text-slate-950">
        <div className="mx-auto flex min-h-dvh w-full max-w-7xl flex-col bg-[#f8faf9] shadow-2xl shadow-slate-300/30 md:grid md:grid-cols-[260px_minmax(0,1fr)] md:bg-transparent md:p-6 md:shadow-none">
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
            <div className="mt-auto rounded-3xl bg-cyan-50 p-4 text-sm leading-6 text-teal-900">
              <p className="font-bold">Heures creuses</p>
              <p className="mt-1 text-teal-800/75">Configure tes creneaux une fois, puis lance tes cycles au bon moment.</p>
            </div>
          </aside>

          <div className="flex min-h-dvh flex-col md:min-h-0 md:px-8">
            <header className="sticky top-0 z-20 bg-[#f8faf9]/95 px-6 pb-4 pt-5 backdrop-blur md:static md:bg-transparent md:px-0 md:pb-6 md:pt-1">
              <div className="md:hidden">
                <Brand />
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-teal-700">CycleSmart</p>
                <h1 className="mt-2 text-4xl font-black tracking-normal text-slate-950">
                  Optimisation des cycles
                </h1>
              </div>
            </header>

            <section className="mx-auto w-full max-w-5xl flex-1 px-5 pb-28 md:px-0 md:pb-8">{children}</section>
          </div>

          <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full bg-white/95 px-5 py-3 shadow-[0_-12px_30px_rgba(15,23,42,0.08)] backdrop-blur md:hidden">
            <div className="mx-auto grid max-w-[430px] grid-cols-3 gap-2 rounded-[24px] bg-slate-100 p-1">
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
        </div>
      </main>
    </CycleProvider>
  );
}

function Brand() {
  return (
    <Link className="flex items-center gap-3" href="/calculer">
      <span className="grid size-10 place-items-center rounded-2xl bg-cyan-400 text-lg font-black text-teal-950">
        CS
      </span>
      <span className="text-2xl font-bold tracking-normal text-teal-700">CycleSmart</span>
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
      className={`flex items-center justify-center gap-2 rounded-[20px] font-bold transition ${
        compact ? "h-12 text-xs" : "h-12 justify-start px-4 text-sm"
      } ${active ? "bg-cyan-400 text-teal-950 shadow-sm" : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"}`}
      href={href}
    >
      <Icon className="size-5" />
      <span>{label}</span>
    </Link>
  );
}
