const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('=== LISTE COMPLÈTE DES PRODUITS ===\n');

        const products = await prisma.product.findMany({
            select: {
                id: true,
                title: true,
                price: true,
                status: true,
                categoryId: true,
                promotionLabel: true,
                isNew: true,
                isTrending: true,
                isBestSeller: true,
                Category: {
                    select: {
                        name: true,
                        parent: {
                            select: {
                                name: true,
                                parent: {
                                    select: { name: true }
                                }
                            }
                        }
                    }
                },
                Store: {
                    select: {
                        name: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        console.log(`Total produits: ${products.length}\n`);

        products.forEach((p, index) => {
            const categoryPath = [];
            if (p.Category) {
                if (p.Category.parent?.parent?.name) categoryPath.push(p.Category.parent.parent.name);
                if (p.Category.parent?.name) categoryPath.push(p.Category.parent.name);
                categoryPath.push(p.Category.name);
            }

            console.log(`${index + 1}. "${p.title}"`);
            console.log(`   Prix: ${p.price} DA`);
            console.log(`   Statut: ${p.status}`);
            console.log(`   Catégorie: ${categoryPath.length > 0 ? categoryPath.join(' → ') : 'AUCUNE'}`);
            console.log(`   Boutique: ${p.Store?.name || 'N/A'}`);

            const badges = [];
            if (p.isNew) badges.push('🆕 NEW');
            if (p.isTrending) badges.push('🔥 TRENDING');
            if (p.isBestSeller) badges.push('⭐ BEST SELLER');
            if (p.promotionLabel) badges.push(`🏷️ ${p.promotionLabel}`);

            if (badges.length > 0) {
                console.log(`   Badges: ${badges.join(', ')}`);
            }
            console.log('');
        });

        // Statistiques par statut
        console.log('\n=== STATISTIQUES PAR STATUT ===');
        const statuses = await prisma.product.groupBy({
            by: ['status'],
            _count: true
        });
        statuses.forEach(s => {
            console.log(`${s.status}: ${s._count} produits`);
        });

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
