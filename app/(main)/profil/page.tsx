import Image from "next/image";
import Link from "next/link";
import { BuyMeACoffeeButton } from "@/components/buy-me-a-coffee-button";
import { ChangePasswordForm } from "@/components/change-password-form";
import { DeleteAccountButton } from "@/components/delete-account-button";
import { DeviceIcon, DownloadIcon, LockIcon, SparkIcon } from "@/components/icons";
import { LegalLinks } from "@/components/legal-links";
import { LogoutButton } from "@/components/logout-button";
import { ProfileStats } from "@/components/profile-stats";
import { SettingsModalRow } from "@/components/settings-modal";
import { getCurrentUser } from "@/lib/current-user";

const installGuides = [
  {
    title: "Sur iPhone",
    Icon: DeviceIcon,
    steps: [
      "Ouvre CycleSmart dans Safari",
      "Touche le bouton de partage",
      "Choisis Sur l'ecran d'accueil",
    ],
  },
  {
    title: "Sur Android",
    Icon: SparkIcon,
    steps: [
      "Ouvre le menu du navigateur",
      "Choisis Installer l'application ou Ajouter a l'ecran d'accueil",
      "Ouvre CycleSmart depuis ton telephone",
    ],
  },
];

function InstallGuideContent() {
  return (
    <div className="space-y-3">
      {installGuides.map(({ Icon, steps, title }) => (
        <article className="surface-sub p-4" key={title}>
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
              <Icon className="size-4" />
            </span>
            <p className="font-black text-stone-950">{title}</p>
          </div>

          <ol className="mt-3 space-y-2.5">
            {steps.map((step, index) => (
              <li className="flex gap-3 text-sm font-semibold leading-5 text-stone-600" key={step}>
                <span className="grid size-5 shrink-0 place-items-center rounded-full bg-white text-[11px] font-black text-emerald-700">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </article>
      ))}
    </div>
  );
}

export default async function ProfilPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl space-y-5 pt-6 md:pt-0">
        <section className="surface-card p-6 text-center">
          <div className="mx-auto grid size-20 place-items-center rounded-full bg-emerald-100">
            <Image alt="CycleSmart" className="size-11" height={44} src="/logo-icon.png" width={44} />
          </div>
          <p className="mt-5 text-3xl font-bold">Aucun compte connecté</p>
          <p className="mt-2 leading-6 text-stone-500">
            Connecte-toi pour sauvegarder tes heures creuses et les retrouver
            plus tard.
          </p>
        </section>

        <section className="grid gap-3">
          <Link
            className="flex h-14 items-center justify-center rounded-2xl bg-emerald-500 px-4 font-bold text-white shadow-cta transition hover:bg-emerald-600 active:scale-[0.99]"
            href="/connexion"
          >
            Connexion
          </Link>
          <Link
            className="flex h-14 items-center justify-center rounded-2xl border border-emerald-200 bg-white px-4 font-bold text-emerald-700 transition hover:bg-emerald-50 active:scale-[0.99]"
            href="/inscription"
          >
            Créer un compte
          </Link>
        </section>

        <section className="surface-card overflow-hidden">
          <SettingsModalRow
            description="Ajouter à l'écran d'accueil"
            icon={<DownloadIcon className="size-4" />}
            label="Installer l'application"
            modalDescription="Ajoute CycleSmart à ton écran d'accueil"
            title="Installer l'application"
          >
            <InstallGuideContent />
          </SettingsModalRow>
        </section>

        <LegalLinks className="justify-center" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <section className="surface-hero relative overflow-hidden p-5 text-white sm:p-6">
        <div
          className="pointer-events-none absolute -right-14 -top-16 size-44 rounded-full border-[24px] border-white/10"
          aria-hidden="true"
        />
        <div className="relative flex items-center gap-4">
          <div className="grid size-16 shrink-0 place-items-center rounded-2xl bg-white/15 font-display text-xl font-black sm:size-18">
            {user.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-display truncate text-xl font-bold tracking-tight sm:text-2xl">{user.name}</p>
            <p className="mt-1 truncate text-sm text-white/70">{user.email}</p>
          </div>
        </div>

        <div className="relative mt-5">
          <ProfileStats />
        </div>
      </section>

      <section className="surface-card divide-y divide-stone-100 overflow-hidden">
        <SettingsModalRow
          description="Modifier ton mot de passe"
          icon={<LockIcon className="size-4" />}
          label="Mot de passe"
          modalDescription="Change ton mot de passe sans toucher à tes créneaux"
          title="Changer le mot de passe"
        >
          <ChangePasswordForm />
        </SettingsModalRow>

        <SettingsModalRow
          description="Ajouter à l'écran d'accueil"
          icon={<DownloadIcon className="size-4" />}
          label="Installer l'application"
          modalDescription="Ajoute CycleSmart à ton écran d'accueil"
          title="Installer l'application"
        >
          <InstallGuideContent />
        </SettingsModalRow>
      </section>

      <section className="surface-card overflow-hidden">
        <div className="border-b border-stone-100 px-5 py-4">
          <p className="text-sm font-bold text-stone-950">Compte</p>
          <p className="text-xs text-stone-400">Gestion de ta session</p>
        </div>
        <div className="grid gap-3 p-5 sm:grid-cols-2">
          <LogoutButton />
          <DeleteAccountButton />
        </div>
      </section>

      <section className="surface-card p-5">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <BuyMeACoffeeButton />
          <LegalLinks />
        </div>
      </section>
    </div>
  );
}
