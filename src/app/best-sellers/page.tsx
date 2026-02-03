import { Metadata } from 'next';
import { PrismaClient } from '@prisma/client';
import ProductGrid from '@/components/ProductGrid';

const prisma = new PrismaClient();

export const metadata: Metadata = {
    title: 'Best Sellers - Achrilik',
    description: 'Les produits les plus populaires sur Achrilik',
};

async function getBestSellers() {
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
        console.error('Failed to fetch best sellers:', error);
        return [];
    }
}

export default async function BestSellersPage() {
    const products = await getBestSellers();

    return (
        <main className="min-h-screen bg-white pb-20">
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Best Sellers</h1>
                    <p className="text-gray-600">Les produits les plus populaires</p>
                </div>
                <ProductGrid products={products} />
            </div>
        </main>
    );
}
