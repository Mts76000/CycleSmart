import { PasswordResetForm } from "@/components/password-reset-form";

export default async function NouveauMotDePassePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token = "" } = await searchParams;

  return <PasswordResetForm token={token} />;
}
