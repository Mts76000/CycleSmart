import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import { faqs } from "./faq-data";
import { FaqSection } from "./faq-section";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: "Calculateur d'heures creuses | CycleSmart",
  description:
    "Calcule le meilleur moment pour lancer ton lave-linge, lave-vaisselle ou autre appareil pendant tes heures creuses EDF, Engie, TotalEnergies ou Linky. Gratuit, sans pub.",
  keywords: [
    "heures creuses",
    "calculateur d'heures creuses",
    "heures creuses EDF",
    "heures creuses Linky",
    "lave linge heures creuses",
    "lave-vaisselle heures creuses",
    "tarif heures creuses",
    "consommation électrique",
    "économie d'énergie",
  ],
  openGraph: {
    title: "Calculateur d'heures creuses | CycleSmart",
    description:
      "Calcule le meilleur moment pour lancer tes appareils pendant tes heures creuses.",
    url: "/calculer",
    siteName: "CycleSmart",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Calculateur d'heures creuses | CycleSmart",
    description:
      "Calcule le meilleur moment pour lancer tes appareils pendant tes heures creuses.",
  },
  alternates: {
    canonical: "/calculer",
  },
};

const webApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "CycleSmart",
  applicationCategory: "LifestyleApplication",
  operatingSystem: "Any",
  url: `${appUrl}/calculer`,
  description:
    "Calcule le meilleur moment pour lancer tes appareils électroménagers pendant les heures creuses.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "EUR",
  },
};

const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "Comment utiliser le calculateur d'heures creuses",
  description:
    "Trouve le meilleur moment pour lancer ton lave-linge ou lave-vaisselle avec CycleSmart.",
  step: [
    {
      "@type": "HowToStep",
      name: "Choisir la durée de cycle",
      text: "Sélectionne la durée de cycle de ton appareil avec le curseur.",
      url: `${appUrl}/calculer`,
    },
    {
      "@type": "HowToStep",
      name: "Ajouter tes heures creuses",
      text: "Indique les plages horaires de ton option heures creuses.",
      url: `${appUrl}/calculer`,
    },
    {
      "@type": "HowToStep",
      name: "Obtenir la recommandation",
      text: "CycleSmart calcule immédiatement le prochain moment idéal pour lancer ta machine.",
      url: `${appUrl}/calculer`,
    },
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map(({ question, answer }) => ({
    "@type": "Question",
    name: question,
    acceptedAnswer: {
      "@type": "Answer",
      text: answer,
    },
  })),
};

export default function CalculerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <FaqSection />
      <JsonLd data={[webApplicationSchema, howToSchema, faqSchema]} />
    </>
  );
}
