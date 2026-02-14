import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NavbarWrapper from "@/components/NavbarWrapper";
import ToastContainer from "@/components/ToastContainer";
import Footer from "@/components/layout/Footer";
import CookieBanner from "@/components/CookieBanner";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Achrilik - Mode & Tendance Algérie | Vêtements en Ligne",
  description: "Achrilik, votre marketplace mode #1 en Algérie. Click & Collect, paiement à la livraison, retrait en boutique. Découvrez des milliers de vêtements et accessoires de qualité.",
  keywords: ["mode algérie", "vêtements en ligne", "achrilik", "click and collect", "shopping algérie", "marketplace algérie", "boutique en ligne", "livraison algérie"],
  authors: [{ name: "Achrilik" }],
  creator: "Achrilik",
  publisher: "Achrilik",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
  openGraph: {
    title: "Achrilik - Mode & Tendance Algérie",
    description: "Marketplace mode #1 en Algérie. Click & Collect, paiement à la livraison.",
    url: "https://achrilik.com",
    siteName: "Achrilik",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Achrilik - Mode & Tendance Algérie"
      }
    ],
    locale: "fr_DZ",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Achrilik - Mode & Tendance Algérie",
    description: "Marketplace mode #1 en Algérie. Click & Collect, paiement à la livraison.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: "https://achrilik.com",
  },
  // ✅ To enable Google Search Console:
  // 1. Go to: https://search.google.com/search-console
  // 2. Add property "achrilik.com"
  // 3. Choose "HTML tag" method
  // 4. Copy the verification code (meta content="...")
  // 5. Uncomment below and add your code:
  // verification: {
  //   google: "your-google-verification-code-here",
  // },
};

import { Providers } from "@/app/providers";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <Providers>
          <ErrorBoundary>
            <NavbarWrapper />
            <div className="pb-[120px] md:pb-0">
              {children}
            </div>
            <Footer />
            <ToastContainer />
            <CookieBanner />
          </ErrorBoundary>
        </Providers>
      </body>
    </html>
  );
}
