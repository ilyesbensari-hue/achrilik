import { prisma } from '@/lib/prisma';
import { Metadata } from 'next';

interface Props {
    params: Promise<{ slug: string }>;
    children: React.ReactNode;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;

    // ✅ BUG-02 FIX: Each category gets its own canonical URL
    const canonicalUrl = `https://achrilik.com/categories/${slug}`;

    try {
        const category = await prisma.category.findFirst({
            where: { slug },
            include: {
                _count: { select: { products: true } }
            }
        });

        if (!category) {
            return {
                title: 'Catégorie | Achrilik',
                alternates: { canonical: canonicalUrl },
            };
        }

        const count = category._count?.products ?? 0;
        const title = `${category.name} — Mode Algérie | Achrilik`;
        const description = `Découvrez ${count > 0 ? `${count} produits` : 'les meilleurs produits'} ${category.name} livrés partout en Algérie. Paiement à la livraison sur Achrilik.`;

        return {
            title,
            description,
            // ✅ BUG-02 FIX: Canonical points to this specific category URL, not homepage
            alternates: {
                canonical: canonicalUrl,
                // ✅ PROB-02 FIX: Declare hreflang for fr and ar versions
                languages: {
                    'fr': canonicalUrl,
                    'ar': `${canonicalUrl}?lang=ar`,
                },
            },
            openGraph: {
                title,
                description,
                url: canonicalUrl,
                siteName: 'Achrilik',
                // ✅ BUG-03 FIX: Always include og:image so social sharing works
                images: [
                    {
                        url: 'https://achrilik.com/og-image.jpg',
                        width: 1200,
                        height: 630,
                        alt: `${category.name} - Achrilik Algérie`,
                    },
                ],
                type: 'website',
                locale: 'fr_DZ',
            },
            twitter: {
                card: 'summary_large_image',
                title,
                description,
                images: ['https://achrilik.com/og-image.jpg'],
            },
        };
    } catch {
        return {
            title: 'Catégorie | Achrilik',
            alternates: { canonical: canonicalUrl },
        };
    }
}

export default function CategoryLayout({ children }: Props) {
    return <>{children}</>;
}
