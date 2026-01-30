import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import DeliveryBanner from "@/components/DeliveryBanner";
import BottomNav from "@/components/BottomNav";
import ToastContainer from "@/components/ToastContainer";
import { PHProvider } from "@/providers/PosthogProvider";
import { GoogleAnalytics } from '@next/third-parties/google';


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
  verification: {
    google: "google-site-verification-code", // TODO: Add actual verification code
  },
};

import { Providers } from "@/app/providers";

// ... (imports)

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <PHProvider>
          <Providers>
            <Navbar />
            <DeliveryBanner />
            <div className="pb-[120px] md:pb-0">
              {children}
            </div>
            <BottomNav />
            <ToastContainer />
          </Providers>
        </PHProvider>
        {process.env.NEXT_PUBLIC_GA_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        )}
      </body>
    </html>
  );
}
