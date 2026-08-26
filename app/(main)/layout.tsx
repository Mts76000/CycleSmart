import { MainShell } from "@/components/main-shell";
import { getOptionalSession } from "@/lib/permissions";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const session = await getOptionalSession();

  return <MainShell isAuthenticated={Boolean(session)}>{children}</MainShell>;
}
