import Image from "next/image";
import Link from "next/link";

const highlights = [
  "Calcule le meilleur moment pour lancer tes machines",
  "Visualise tes heures creuses sur une frise horaire",
  "Retrouve tes reglages sur tous tes appareils",
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-dvh bg-[#eef2f1] text-slate-950 md:p-5">
      <div className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col md:min-h-0 md:flex-row md:gap-5">
        <aside className="relative hidden shrink-0 basis-[42%] flex-col justify-between overflow-hidden rounded-[32px] bg-emerald-700 p-10 text-white md:flex">
          <div
            className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full border-[36px] border-white/10"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-28 -left-16 size-64 rounded-full border-[28px] border-white/10"
            aria-hidden="true"
          />

          <Link className="relative flex items-center gap-3" href="/calculer">
            <span className="grid size-11 place-items-center rounded-2xl bg-white/15">
              <Image alt="CycleSmart" className="size-7" height={28} priority src="/logo-icon.png" width={28} />
            </span>
            <span className="font-display text-xl font-bold tracking-tight">CycleSmart</span>
          </Link>

          <div className="relative">
            <p className="font-display text-3xl font-bold leading-tight tracking-tight lg:text-4xl">
              Lance tes machines au meilleur moment.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-white/75">
              {highlights.map((highlight) => (
                <li className="flex items-start gap-2.5" key={highlight}>
                  <span className="mt-1 size-1.5 shrink-0 rounded-full bg-white/60" aria-hidden="true" />
                  {highlight}
                </li>
              ))}
            </ul>
          </div>

          <p className="relative text-xs font-semibold text-white/50">
            Gratuit, sans pub, pense pour reduire ta facture d&apos;electricite.
          </p>
        </aside>

        <div className="flex flex-1 flex-col justify-center px-5 py-8 sm:px-8 md:px-10">
          <div className="mx-auto w-full max-w-[420px]">
            <Link className="mx-auto grid size-14 place-items-center rounded-2xl bg-white shadow-cta transition active:scale-[0.97] md:hidden" href="/calculer">
              <Image alt="CycleSmart" className="size-8" height={32} priority src="/logo-icon.png" width={32} />
            </Link>
            <div className="mt-5 text-center md:hidden">
              <p className="font-display text-2xl font-bold tracking-tight">CycleSmart</p>
              <p className="mt-1 text-sm text-slate-600">Optimise tes cycles au meilleur moment.</p>
            </div>
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}
