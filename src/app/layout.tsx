import type { Metadata } from "next";
import { DM_Sans, Noto_Sans_Arabic } from "next/font/google";
import "./globals.css";
import NavbarWrapper from "@/components/NavbarWrapper";
import ToastContainer from "@/components/ToastContainer";
import Footer from "@/components/layout/Footer";
import CookieBanner from "@/components/CookieBanner";


const dmSans = DM_Sans({ subsets: ["latin"], weight: ['400', '500', '700'], variable: '--font-dm-sans' });
const notoSansArabic = Noto_Sans_Arabic({ subsets: ["arabic"], weight: ['400', '500', '700'], variable: '--font-noto-arabic' });

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
    title: "Achrilik | أشريليك - Mode & Tendance Algérie",
    description: "Marketplace mode #1 en Algérie — المتجر الإلكتروني #1 في الجزائر. Click & Collect, paiement à la livraison.",
    url: "https://achrilik.com",
    siteName: "Achrilik",
    images: [
      {
        url: "https://achrilik.com/og-image.jpg",
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
    images: ["https://achrilik.com/og-image.jpg"],
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
  // ✅ BUG-02 FIX: Do NOT set a global canonical here.
  // Each page defines its own canonical via generateMetadata or page-level metadata.
  // The homepage canonical is defined in src/app/page.tsx.
  // ✅ PROB-02 FIX: Declare global hreflang for fr/ar multilingual support
  alternates: {
    canonical: 'https://achrilik.com',
    languages: {
      'fr': 'https://achrilik.com',
      'ar': 'https://achrilik.com/?lang=ar',
    },
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Achrilik",
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
import PWARegistration from "@/components/PWARegistration";
import { LanguageProvider } from "@/contexts/LanguageContext";
import dynamic from 'next/dynamic';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" dir="ltr">
      <head>
        <link rel="apple-touch-icon" sizes="152x152" href="/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icon-192x192.png" />
        <meta name="theme-color" content="#006233" />
      </head>
      <body className={`${dmSans.variable} ${notoSansArabic.variable} font-sans`}>
        <Providers>
          <LanguageProvider>
            <ErrorBoundary>
              <PWARegistration />
              <NavbarWrapper />
              <div className="pb-[120px] md:pb-0">
                {children}
              </div>
              <Footer />
              <ToastContainer />
              <CookieBanner />
            </ErrorBoundary>
          </LanguageProvider>
        </Providers>
      </body>
    </html>
  );
}
