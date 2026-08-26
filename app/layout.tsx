import type { Metadata, Viewport } from "next";
import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
import { ToastProvider } from "@/components/ui/toast";
import { UmamiScript } from "@/components/umami-script";
import { canonicalUrl, organizationJsonLd } from "@/lib/seo";
import { env } from "@/lib/env";
import ServiceWorkerRegister from "@/components/service-worker-register";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
});

// CycleSmart's original display font for headings/big numbers (TimeDial, stats,
// page titles) — see .font-display in globals.css. Lighter letterforms than
// Plus Jakarta Sans, which is what made those elements read as "blacker"/denser
// when this was missing during the migration.
const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const appName = env.NEXT_PUBLIC_APP_NAME;
const description =
  "Calcule le meilleur moment pour lancer tes machines pendant les heures creuses.";

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: {
    default: appName,
    template: `%s | ${appName}`,
  },
  description,
  alternates: { canonical: canonicalUrl("/") },
  openGraph: {
    title: appName,
    description,
    url: canonicalUrl("/"),
    siteName: appName,
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: appName,
    description,
  },
  appleWebApp: {
    title: appName,
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f5f7f7",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${plusJakarta.variable} ${outfit.variable} h-full antialiased`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }}
        />
      </head>
      {/* suppressHydrationWarning: browser extensions (ColorZilla, Grammarly, etc.) inject
          attributes like cz-shortcut-listen into <body> before React hydrates. Harmless. */}
      <body
        className="bg-background text-foreground flex min-h-full flex-col"
        suppressHydrationWarning
      >
        <a
          href="#main-content"
          className="focus:bg-primary focus:text-on-primary sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:px-4 focus:py-2"
        >
          Aller au contenu principal
        </a>
        <ToastProvider>{children}</ToastProvider>
        <UmamiScript />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
