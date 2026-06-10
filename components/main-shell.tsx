"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CycleProvider } from "../lib/cycle-store";

const tabs = [
  { href: "/calculer", label: "Calculer", icon: "⌚" },
  { href: "/creneaux", label: "Creneaux", icon: "▦" },
  { href: "/profil", label: "Profil", icon: "○" },
];

export function MainShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <CycleProvider>
      <main className="min-h-dvh bg-[#f5f7f7] text-slate-950">
        <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-[#f8faf9] shadow-2xl shadow-slate-300/40">
          <header className="sticky top-0 z-20 bg-[#f8faf9]/95 px-6 pb-4 pt-5 backdrop-blur">
            <Link className="flex items-center gap-3" href="/calculer">
              <span className="grid size-9 place-items-center rounded-2xl bg-cyan-400 text-lg font-black text-teal-950">
                °°
              </span>
              <span className="text-2xl font-bold tracking-normal text-teal-700">CycleSmart</span>
            </Link>
          </header>

          <section className="flex-1 px-5 pb-28">{children}</section>

          <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-[430px] bg-white/95 px-5 py-3 shadow-[0_-12px_30px_rgba(15,23,42,0.08)] backdrop-blur">
            <div className="grid grid-cols-3 gap-2 rounded-[24px] bg-slate-100 p-1">
              {tabs.map((tab) => {
                const active = pathname === tab.href;

                return (
                  <Link
                    className={`flex h-12 items-center justify-center gap-1 rounded-[20px] text-xs font-bold transition ${
                      active ? "bg-cyan-400 text-teal-950 shadow-sm" : "text-slate-500"
                    }`}
                    href={tab.href}
                    key={tab.href}
                  >
                    <span className="text-lg leading-none">{tab.icon}</span>
                    <span>{tab.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      </main>
    </CycleProvider>
  );
}
