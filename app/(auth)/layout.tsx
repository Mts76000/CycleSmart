import { TopBar } from "@/components/main-shell";
import { Footer } from "@/components/footer";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="bg-cycle-background min-h-dvh">
      <div className="mx-auto flex min-h-dvh w-full max-w-[1400px] flex-col md:p-5">
        <div className="flex min-h-dvh flex-col">
          <TopBar isAuthenticated={false} />
          <section
            id="main-content"
            className="mx-auto flex w-full max-w-6xl flex-1 items-center justify-center px-4 py-12 sm:px-6 md:px-8"
          >
            <div className="w-full max-w-sm">{children}</div>
          </section>
          <div className="mx-auto w-full max-w-6xl px-4 pb-8 sm:px-6 md:px-8">
            <Footer />
          </div>
        </div>
      </div>
    </main>
  );
}
