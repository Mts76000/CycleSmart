import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { themeInitScript } from "@/lib/theme-script";
import { ToastProvider } from "@/components/ui/toast";
import { UmamiScript } from "@/components/umami-script";
import { canonicalUrl, organizationJsonLd } from "@/lib/seo";
import { env } from "@/lib/env";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const description =
  "Calcule le meilleur moment pour lancer tes machines pendant les heures creuses.";

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: {
    default: "CycleSmart",
    template: "%s | CycleSmart",
  },
  description,
  alternates: { canonical: canonicalUrl("/") },
  openGraph: {
    title: "CycleSmart",
    description,
    url: canonicalUrl("/"),
    siteName: "CycleSmart",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CycleSmart",
    description,
  },
  appleWebApp: {
    title: "CycleSmart",
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f7f7" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1120" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="fr"
      className={`${plusJakarta.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }}
        />
      </head>
      {/* suppressHydrationWarning: browser extensions (ColorZilla, Grammarly, etc.) inject
          attributes like cz-shortcut-listen into <body> before React hydrates. Harmless —
          the <html> suppression above doesn't cover this element too. */}
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
      </body>
    </html>
  );
}
