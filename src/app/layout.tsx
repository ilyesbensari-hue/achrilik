import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import DeliveryBanner from "@/components/DeliveryBanner";
import BottomNav from "@/components/BottomNav";
import { PHProvider } from "@/providers/PosthogProvider";
import { GoogleAnalytics } from '@next/third-parties/google';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Achrilik - Mode & Tendance Algérie",
  description: "Vente de vêtements en ligne en Algérie. Click & Collect, Paiement à la livraison.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <PHProvider>
          <Navbar />
          <DeliveryBanner />
          <div className="pb-[120px] md:pb-0">
            {children}
          </div>
          <BottomNav />
        </PHProvider>
        {process.env.NEXT_PUBLIC_GA_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        )}
      </body>
    </html>
  );
}
