import { Metadata } from 'next';
import { PrismaClient } from '@prisma/client';
import ProductGrid from '@/components/ProductGrid';

const prisma = new PrismaClient();

export const metadata: Metadata = {
    title: 'Nouveautés - Achrilik',
    description: 'Découvrez les derniers produits ajoutés sur Achrilik',
};

async function getNewArrivals() {
    try {
        const products = await prisma.product.findMany({
            where: {
                status: 'APPROVED',
            },
            include: {
                Store: {
                    select: {
                        name: true,
                        city: true,
                    },
                },
                Category: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: 100,
        });

        // Map Store to store for ProductGrid compatibility
        return products.map(p => ({
            ...p,
            store: p.Store,
            category: p.Category
        }));
    } catch (error) {
        console.error('Failed to fetch new arrivals:', error);
        return [];
    }
}

export default async function NouveautesPage() {
    const products = await getNewArrivals();

    return (
        <main className="min-h-screen bg-white pb-20">
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Nouveautés</h1>
                    <p className="text-gray-600">Les derniers produits ajoutés sur Achrilik</p>
                </div>
                <ProductGrid products={products} />
            </div>
        </main>
    );
}
