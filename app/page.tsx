import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "CycleSmart",
  description: "Calcule le meilleur moment pour lancer tes machines pendant les heures creuses.",
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: "/calculer",
  },
};

export default function HomePage() {
  redirect("/calculer");
}
