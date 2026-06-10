import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-dvh bg-[linear-gradient(180deg,#dffbfb_0%,#f8faf9_34%)] px-5 py-8 text-slate-950">
      <div className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-[430px] flex-col">
        <Link className="mx-auto grid size-16 place-items-center rounded-3xl bg-cyan-400 text-3xl font-black text-teal-950 shadow-lg shadow-cyan-300/40" href="/calculer">
          °°
        </Link>
        <div className="mt-6 text-center">
          <p className="text-3xl font-bold">CycleSmart</p>
          <p className="mt-2 text-slate-600">Optimise tes cycles de lavage au meilleur moment.</p>
        </div>
        {children}
      </div>
    </main>
  );
}
