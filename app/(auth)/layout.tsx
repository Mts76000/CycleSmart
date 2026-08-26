import { BrandMark } from "@/components/main-shell";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-cycle-background flex min-h-dvh flex-col">
      <header className="w-full px-4 pt-5 pb-4 sm:px-6 md:px-8">
        <div className="flex w-full flex-col items-center justify-center gap-3 sm:flex-row sm:justify-between">
          <BrandMark />
        </div>
      </header>
      <main id="main-content" className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">{children}</div>
      </main>
    </div>
  );
}
