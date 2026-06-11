import { MainShell } from "@/components/main-shell";
import { getCurrentUser } from "@/lib/current-user";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return <MainShell isAuthenticated={Boolean(user)}>{children}</MainShell>;
}
