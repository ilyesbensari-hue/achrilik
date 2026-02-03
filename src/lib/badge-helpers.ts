import { prisma } from '@/lib/prisma';

/**
 * Vérifie si un produit est considéré comme "nouveau" (créé il y a moins de 3 jours)
 */
export function isProductNew(createdAt: Date): boolean {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    return new Date(createdAt) > threeDaysAgo;
}

/**
 * Récupère les IDs des 10 produits les plus vendus
 */
export async function getTop10BestSellerIds(): Promise<string[]> {
    try {
        // OrderItem n'a pas productId, il faut joindre via Variant
        const orderItems = await prisma.orderItem.findMany({
            include: {
                Variant: {
                    select: {
                        productId: true
                    }
                }
            }
        });

        // Grouper manuellement par productId
        const productSales: Record<string, number> = {};
        orderItems.forEach(item => {
            const productId = item.Variant.productId;
            productSales[productId] = (productSales[productId] || 0) + item.quantity;
        });

        // Trier par quantité et prendre top 10
        const sortedProducts = Object.entries(productSales)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([productId]) => productId);

        return sortedProducts;
    } catch (error) {
        console.error('Error fetching top 10 best sellers:', error);
        return [];
    }
}

/**
 * Vérifie si un produit est dans le top 10 des ventes
 */
export async function isProductBestSeller(productId: string): Promise<boolean> {
    const top10Ids = await getTop10BestSellerIds();
    return top10Ids.includes(productId);
}

/**
 * Vérifie si un produit a une promotion active
 */
export function hasActivePromotion(promotionLabel: string | null): boolean {
    return promotionLabel !== null && promotionLabel.trim() !== '';
}

/**
 * Calcule tous les badges pour un produit donné
 * @param productId ID du produit
 * @param createdAt Date de création (pour éviter une query)
 * @param promotionLabel Label de promotion (pour éviter une query)
 */
export async function calculateProductBadges(
    productId: string,
    createdAt: Date,
    promotionLabel: string | null
): Promise<{
    isNew: boolean;
    isBestSeller: boolean;
    hasPromo: boolean;
}> {
    const [isBestSeller] = await Promise.all([
        isProductBestSeller(productId)
    ]);

    return {
        isNew: isProductNew(createdAt),
        isBestSeller,
        hasPromo: hasActivePromotion(promotionLabel)
    };
}

/**
 * Recalcule les badges pour tous les produits (pour cron job ou admin action)
 */
export async function recalculateAllBadges(): Promise<number> {
    try {
        const top10Ids = await getTop10BestSellerIds();
        const allProducts = await prisma.product.findMany({
            select: {
                id: true,
                createdAt: true,
                promotionLabel: true
            }
        });

        let updatedCount = 0;

        for (const product of allProducts) {
            const newBadges = {
                isNew: isProductNew(product.createdAt),
                isBestSeller: top10Ids.includes(product.id),
                // Note: isTrending reste inchangé (géré manuellement par admin)
            };

            await prisma.product.update({
                where: { id: product.id },
                data: newBadges
            });

            updatedCount++;
        }

        return updatedCount;
    } catch (error) {
        console.error('Error recalculating badges:', error);
        throw error;
    }
}
