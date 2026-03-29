import { prisma } from '@/lib/prisma';
import type { Metadata } from 'next';

// ✅ BUG-02 FIX: Each store page gets its own canonical URL
export async function generateMetadata({
    params,
}: {
    params: Promise<{ id: string }>;
}): Promise<Metadata> {
    const { id } = await params;

    const canonicalUrl = `https://achrilik.com/stores/${id}`;

    try {
        const store = await prisma.store.findUnique({
            where: { id },
            select: {
                name: true,
                description: true,
                city: true,
                _count: { select: { Product: true } },
            },
        });

        if (!store) {
            return {
                title: 'Boutique | Achrilik',
                alternates: { canonical: canonicalUrl },
            };
        }

        const title = `${store.name} — Boutique Achrilik${store.city ? ` à ${store.city}` : ''}`;
        const productCount = store._count?.Product ?? 0;
        const description = store.description
            || `Découvrez les ${productCount > 0 ? `${productCount} produits de ` : ''}${store.name}${store.city ? ` à ${store.city}` : ''} sur Achrilik. Paiement à la livraison, Click & Collect disponible.`;

        return {
            title,
            description: description.substring(0, 160),
            alternates: {
                canonical: canonicalUrl,
            },
            openGraph: {
                title,
                description: description.substring(0, 160),
                url: canonicalUrl,
                siteName: 'Achrilik',
                images: [
                    {
                        url: 'https://achrilik.com/og-image.jpg',
                        width: 1200,
                        height: 630,
                        alt: `${store.name} - Boutique Achrilik`,
                    },
                ],
                locale: 'fr_DZ',
                type: 'website',
            },
            twitter: {
                card: 'summary_large_image',
                title,
                description: description.substring(0, 160),
                images: ['https://achrilik.com/og-image.jpg'],
            },
        };
    } catch {
        return {
            title: 'Boutique | Achrilik',
            alternates: { canonical: canonicalUrl },
        };
    }
}

export default function StoreDetailLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
