import type { Metadata } from 'next';

// ✅ BUG-02 FIX: Stores page needs its own canonical, not the homepage's
export const metadata: Metadata = {
    title: 'Nos Boutiques Partenaires | Achrilik',
    description: 'Trouvez les boutiques partenaires Achrilik près de chez vous. Click & Collect disponible dans les principales villes d\'Algérie.',
    alternates: {
        canonical: 'https://achrilik.com/stores',
        languages: {
            'fr': 'https://achrilik.com/stores',
            'ar': 'https://achrilik.com/stores?lang=ar',
        },
    },
    openGraph: {
        title: 'Nos Boutiques Partenaires | Achrilik',
        description: 'Trouvez les boutiques Achrilik près de chez vous. Click & Collect dans toute l\'Algérie.',
        url: 'https://achrilik.com/stores',
        siteName: 'Achrilik',
        images: [
            {
                url: 'https://achrilik.com/og-image.jpg',
                width: 1200,
                height: 630,
                alt: 'Boutiques Achrilik en Algérie',
            },
        ],
        locale: 'fr_DZ',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Nos Boutiques Partenaires | Achrilik',
        description: 'Trouvez les boutiques Achrilik près de chez vous.',
        images: ['https://achrilik.com/og-image.jpg'],
    },
};

export default function StoresLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
