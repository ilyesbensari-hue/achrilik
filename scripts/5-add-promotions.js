const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addPromotions() {
    try {
        console.log('🏷️  Adding promotion labels to products...\n');

        // Get all products
        const products = await prisma.product.findMany({
            select: {
                id: true,
                title: true,
                price: true,
                Category: { select: { name: true } }
            }
        });

        console.log(`Found ${products.length} products\n`);

        // Add -20% promotion to Robe Kabyle
        const robe = products.find(p => p.title.includes('Robe Kabyle'));
        if (robe) {
            const discountPrice = Math.round(robe.price * 0.8); // -20%
            await prisma.product.update({
                where: { id: robe.id },
                data: {
                    promotionLabel: 'PROMO -20%',
                    discountPrice: discountPrice
                }
            });
            console.log(`✅ Added -20% promo to "${robe.title}"`);
            console.log(`   ${robe.price} DA → ${discountPrice} DA`);
        }

        // Add -15% to some T-shirts
        const tshirts = products.filter(p => p.title.includes('T-Shirt')).slice(0, 3);
        for (const tshirt of tshirts) {
            const discountPrice = Math.round(tshirt.price * 0.85); // -15%
            await prisma.product.update({
                where: { id: tshirt.id },
                data: {
                    promotionLabel: 'PROMO -15%',
                    discountPrice: discountPrice
                }
            });
            console.log(`✅ Added -15% promo to "${tshirt.title}"`);
            console.log(`   ${tshirt.price} DA → ${discountPrice} DA`);
        }

        // Add -30% to Écouteurs
        const ecouteurs = products.find(p => p.title.includes('Écouteurs'));
        if (ecouteurs) {
            const discountPrice = Math.round(ecouteurs.price * 0.7); // -30%
            await prisma.product.update({
                where: { id: ecouteurs.id },
                data: {
                    promotionLabel: 'PROMO -30%',
                    discountPrice: discountPrice
                }
            });
            console.log(`✅ Added -30% promo to "${ecouteurs.title}"`);
            console.log(`   ${ecouteurs.price} DA → ${discountPrice} DA`);
        }

        console.log('\n✅ Promotions added successfully!');

        // Verify
        const promoProducts = await prisma.product.findMany({
            where: {
                promotionLabel: { not: null }
            },
            select: {
                title: true,
                price: true,
                discountPrice: true,
                promotionLabel: true
            }
        });

        console.log(`\n📊 Total products with promotions: ${promoProducts.length}`);
        promoProducts.forEach(p => {
            console.log(`  - ${p.title}: ${p.promotionLabel} (${p.price} → ${p.discountPrice} DA)`);
        });

    } catch (error) {
        console.error('❌ Error adding promotions:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

addPromotions();
