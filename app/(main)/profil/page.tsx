import Link from "next/link";
import {
  BellIcon,
  DeviceIcon,
  LockIcon,
  MoneyIcon,
  UserIcon,
} from "../../../components/icons";
import { LogoutButton } from "../../../components/logout-button";
import { getCurrentUser } from "../../../lib/current-user";

const profileSections = [
  {
    title: "Mes appareils",
    description: "Lave-linge, lave-vaisselle et machines ajoutees",
    status: "Disponible",
    icon: DeviceIcon,
  },
  {
    title: "Mes tarifs",
    description: "Prix heures pleines et heures creuses",
    status: "A venir",
    icon: MoneyIcon,
  },
  {
    title: "Notifications",
    description: "Rappels avant le meilleur depart",
    status: "A venir",
    icon: BellIcon,
  },
  {
    title: "Changer mot de passe",
    description: "Securite du compte",
    status: "A venir",
    icon: LockIcon,
  },
];

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
            Connecte-toi pour sauvegarder tes heures creuses et les retrouver plus tard.
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
      </div>
    );
  }

  return (
    <div className="grid gap-5 pt-6 md:grid-cols-[minmax(0,1fr)_360px] md:items-start md:pt-0">
      <section className="rounded-[28px] bg-white p-6 text-center shadow-xl shadow-slate-200/70 md:p-8">
        <div className="mx-auto grid size-20 place-items-center rounded-full bg-emerald-500 text-2xl font-black text-white">
          {user.name.slice(0, 2).toUpperCase()}
        </div>
        <p className="mt-5 text-3xl font-bold">{user.name}</p>
        <p className="mt-1 text-slate-500">{user.email}</p>
      </section>

      <section className="rounded-[24px] bg-white p-5 shadow-sm md:row-start-1 md:col-start-2">
        <p className="text-lg font-bold">Synchronisation</p>
        <p className="mt-2 leading-6 text-slate-500">
          Tes creneaux sont associes a ton compte et sauvegardes automatiquement.
        </p>
      </section>

      <section className="rounded-[28px] bg-white p-3 shadow-xl shadow-slate-200/70 md:col-start-1">
        {profileSections.map((section) => {
          const Icon = section.icon;

          return (
            <div
              className="flex w-full items-center gap-4 rounded-3xl p-4"
              key={section.title}
            >
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-green-50 text-emerald-700">
                <Icon className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-bold text-slate-950">{section.title}</span>
                <span className="mt-1 block text-sm leading-5 text-slate-500">
                  {section.description}
                </span>
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
                {section.status}
              </span>
            </div>
          );
        })}
      </section>

      <section className="rounded-[24px] bg-green-50 p-5 md:col-start-2">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-2xl bg-white text-emerald-700">
            <UserIcon className="size-5" />
          </span>
          <div>
            <p className="font-bold text-emerald-950">Compte actif</p>
            <p className="mt-1 text-sm leading-5 text-emerald-900/70">
              Les prochains reglages pourront etre synchronises avec ton compte.
            </p>
          </div>
        </div>
      </section>

      <div className="md:col-start-2">
        <LogoutButton />
      </div>
    </div>
  );
}
