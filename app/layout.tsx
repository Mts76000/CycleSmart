import type { Metadata } from "next";
import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
import ServiceWorkerRegister from "@/components/service-worker-register";
import "./globals.css";

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
  title: "CycleSmart - Heures creuses",
  description:
    "Calculateur mobile-first pour lancer ses machines pendant les heures creuses.",
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
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
