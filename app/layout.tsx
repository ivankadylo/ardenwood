import type { Metadata } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CookieConsent from "@/components/CookieConsent";
import ComparisonBar from "@/components/ComparisonBar";
import { LanguageProvider } from "@/lib/LanguageContext";

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant-garamond",
});

const jost = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-jost",
});

export const metadata: Metadata = {
  title: "Arden Wood — Handcrafted Oak Furniture",
  description: "Each piece is crafted from solid European oak by hand. No mass production. No compromises. Only furniture that will outlive generations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${cormorantGaramond.variable} ${jost.variable} font-sans antialiased`}>
        <LanguageProvider>
          <Navbar />
          <main>{children}</main>
          <ComparisonBar />
          <Footer />
          <CookieConsent />
        </LanguageProvider>
      </body>
    </html>
  );
}
