import { prisma } from '@/lib/prisma';
import ProductCard from './ProductCard';
import Link from 'next/link';

// Server Component - Fetch real products
async function getProducts() {
    try {
        const products = await prisma.product.findMany({
            where: {
                status: 'APPROVED',
                Category: {
                    OR: [
                        { slug: { contains: 'vetement' } },
                        { slug: { contains: 'maroquinerie' } },
                        { slug: { contains: 'accessoire' } },
                    ]
                }
            },
            include: {
                Category: true,
                Variant: {
                    take: 1,
                },
                Store: {
                    select: {
                        name: true,
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 12
        });

        return products.map(p => {
            const images = p.images ? p.images.split(',') : [];
            const firstVariant = p.Variant[0];
            return {
                id: p.id,
                title: p.title,
                price: p.discountPrice || p.price,
                originalPrice: p.discountPrice ? p.price : null,
                image: images[0] || '/placeholder-product.png',
                isNew: (Date.now() - new Date(p.createdAt).getTime()) < 7 * 24 * 60 * 60 * 1000, // 7 days
                categoryName: p.Category?.name || 'Produit',
                stock: firstVariant?.stock || 0,
                promotionLabel: p.promotionLabel,
            };
        });
    } catch (error) {
        console.error('Failed to fetch products:', error);
        return [];
    }
}

export default async function BestSellerGrid() {
    const products = await getProducts();

    if (products.length === 0) {
        return (
            <div className="px-4 mb-24">
                <h3 className="font-bold text-[#212121] text-lg mb-4">Nos Produits</h3>
                <div className="text-center py-12 text-gray-400">
                    <p>Aucun produit disponible pour le moment.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="px-4 mb-24">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-[#212121] text-lg">Nos Produits</h3>
                <Link href="/products" className="text-xs text-[#757575] font-medium hover:text-[#C62828]">
                    Voir tout
                </Link>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    );
}
