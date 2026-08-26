import { BrandMark } from "@/components/main-shell";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="bg-cycle-background min-h-dvh">
      <div className="mx-auto flex min-h-dvh w-full max-w-[1400px] flex-col md:p-5">
        <div className="flex min-h-dvh flex-col">
          <header className="w-full px-4 pt-5 pb-4 sm:px-6 md:px-8">
            <div className="flex w-full flex-col items-center justify-center gap-3 sm:flex-row sm:justify-between">
              <BrandMark />
            </div>
          </header>
          <section
            id="main-content"
            className="mx-auto flex w-full max-w-6xl flex-1 items-center justify-center px-4 py-12 sm:px-6 md:px-8"
          >
            <div className="w-full max-w-sm">{children}</div>
          </section>
        </div>
      </div>
    </main>
  );
}
