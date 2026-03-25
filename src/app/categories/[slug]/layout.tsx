import { prisma } from '@/lib/prisma';
import { Metadata } from 'next';

interface Props {
    params: Promise<{ slug: string }>;
    children: React.ReactNode;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;

    try {
        const category = await prisma.category.findFirst({
            where: { slug },
            include: {
                _count: { select: { products: true } }
            }
        });

        if (!category) {
            return { title: 'Catégorie | Achrilik' };
        }

        const count = category._count?.products ?? 0;
        const title = `${category.name} — Mode Algérie | Achrilik`;
        const description = `Découvrez ${count > 0 ? `${count} produits` : 'les meilleurs produits'} ${category.name} livrés depuis Oran. Vêtements algériens de qualité sur Achrilik.`;

        return {
            title,
            description,
            openGraph: {
                title,
                description,
                url: `https://achrilik.com/categories/${slug}`,
                siteName: 'Achrilik',
                type: 'website',
                locale: 'fr_DZ',
            },
            twitter: {
                card: 'summary',
                title,
                description,
            },
        };
    } catch {
        return { title: 'Catégorie | Achrilik' };
    }
}

export default function CategoryLayout({ children }: Props) {
    return <>{children}</>;
}
