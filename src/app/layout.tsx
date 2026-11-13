import type { Metadata } from "next";
import { Cinzel, Inter } from "next/font/google";
import SiteHeader from "@/components/layout/SiteHeader";
import "./globals.css";

const inter = Inter({ variable: "--font-body", subsets: ["latin"] });
const cinzel = Cinzel({ variable: "--font-display", subsets: ["latin"], weight: ["600", "700"] });

export const metadata: Metadata = {
  title: "Deckforge",
  description: "Compare deux versions d'un deck Magic et valide les cartes à ajouter et à retirer.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${inter.variable} ${cinzel.variable}`}>
      <body>
        <SiteHeader />
        <main className="page">{children}</main>
        <footer className="site-footer">
          Images et données des cartes : Scryfall. Magic: The Gathering est une marque de Wizards of the Coast.
        </footer>
      </body>
    </html>
  );
}
