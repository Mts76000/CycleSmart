import Link from "next/link";
import { ChangePasswordForm } from "@/components/change-password-form";
import { DeviceIcon, SparkIcon } from "@/components/icons";
import { LogoutButton } from "@/components/logout-button";
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

function InstallGuide() {
  return (
    <section className="rounded-[28px] bg-white p-5 shadow-xl shadow-slate-200/70 md:col-span-2 md:p-6">
      <p className="text-xl font-bold text-slate-950">
        Ajouter CycleSmart sur ton telephone
      </p>
      <p className="mt-2 max-w-2xl leading-6 text-slate-500">
        Garde l&apos;app avec tes autres apps pour ouvrir le calculateur plus
        vite.
      </p>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {installGuides.map(({ Icon, steps, title }) => (
          <article className="rounded-3xl bg-slate-50 p-4" key={title}>
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-2xl bg-green-50 text-emerald-700">
                <Icon className="size-5" />
              </span>
              <p className="font-black text-slate-950">{title}</p>
            </div>

            <ol className="mt-4 space-y-3">
              {steps.map((step, index) => (
                <li
                  className="flex gap-3 text-sm font-semibold leading-5 text-slate-600"
                  key={step}
                >
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-white text-xs font-black text-emerald-700">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </article>
        ))}
      </div>
    </section>
  );
}

export default async function ProfilPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl space-y-5 pt-6 md:pt-0">
        <section className="rounded-[28px] bg-white p-6 text-center shadow-xl shadow-slate-200/70">
          <div className="mx-auto grid size-20 place-items-center rounded-full bg-green-100 text-3xl font-black text-emerald-700">
            CS
          </div>
          <p className="mt-5 text-3xl font-bold">Aucun compte connecte</p>
          <p className="mt-2 leading-6 text-slate-500">
            Connecte-toi pour sauvegarder tes heures creuses et les retrouver
            plus tard.
          </p>
        </section>

        <section className="grid gap-3">
          <Link
            className="flex h-14 items-center justify-center rounded-2xl bg-emerald-500 px-4 font-bold text-white shadow-lg shadow-emerald-300/40"
            href="/connexion"
          >
            Connexion
          </Link>
          <Link
            className="flex h-14 items-center justify-center rounded-2xl border border-emerald-200 bg-white px-4 font-bold text-emerald-700"
            href="/inscription"
          >
            Creer un compte
          </Link>
        </section>

        <InstallGuide />
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-3xl gap-5 pt-6 md:grid-cols-[minmax(0,1fr)_260px] md:items-start md:pt-0">
      <section className="rounded-[28px] bg-white p-6 text-center shadow-xl shadow-slate-200/70 md:p-8">
        <div className="mx-auto grid size-20 place-items-center rounded-full bg-emerald-500 text-2xl font-black text-white">
          {user.name.slice(0, 2).toUpperCase()}
        </div>
        <p className="mt-5 text-3xl font-bold">{user.name}</p>
        <p className="mt-1 text-slate-500">{user.email}</p>
      </section>

      <section className="rounded-[24px] bg-white p-5 shadow-sm md:row-start-1 md:col-start-2 h-full ">
        <p className="text-lg font-bold">Synchronisation</p>
        <p className="mt-2 leading-6 text-slate-500">
          Tes creneaux sont associes a ton compte et sauvegardes
          automatiquement.
        </p>
      </section>

      <InstallGuide />

      <div className="md:col-span-2">
        <ChangePasswordForm />
      </div>

      <div className="md:col-start-2">
        <LogoutButton />
      </div>
    </div>
  );
}
