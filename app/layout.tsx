import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CycleSmart - Heures creuses",
  description: "Calculateur mobile-first pour lancer ses machines pendant les heures creuses.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
