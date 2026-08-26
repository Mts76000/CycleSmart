import type { Metadata } from "next";
import Script from "next/script";
import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
import { CookieBanner } from "@/components/cookie-banner";
import ServiceWorkerRegister from "@/components/service-worker-register";
import "./globals.css";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "http://localhost:3000";

const bodyFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-body",
  display: "swap",
});

const headingFont = Outfit({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-heading",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: "CycleSmart - Heures creuses",
  description:
    "Calcule le meilleur moment pour lancer ton lave-linge, lave-vaisselle ou autre appareil pendant les heures creuses. Gratuit, sans pub.",
  keywords: [
    "heures creuses",
    "lave-linge",
    "lave-vaisselle",
    "économie d'énergie",
    "calculateur",
    "EDF",
    "Linky",
    "consommation électrique",
  ],
  authors: [{ name: "CycleSmart" }],
  creator: "CycleSmart",
  openGraph: {
    title: "CycleSmart - Heures creuses",
    description:
      "Calcule le meilleur moment pour lancer tes machines pendant les heures creuses.",
    url: "/",
    siteName: "CycleSmart",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CycleSmart - Heures creuses",
    description:
      "Calcule le meilleur moment pour lancer tes machines pendant les heures creuses.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`h-full antialiased ${bodyFont.variable} ${headingFont.variable}`}>
      <body className="min-h-full flex flex-col">
        {children}
        <CookieBanner />
        <ServiceWorkerRegister />
        <Script
          strategy="beforeInteractive"
          src="http://umami-587uoxmh6bswbfvi2ihyi2zz.72.61.109.246.sslip.io/script.js"
          data-website-id="0d9dace8-6c75-4189-aa13-0d3ffd5b0265"
        />
      </body>
    </html>
  );
}
