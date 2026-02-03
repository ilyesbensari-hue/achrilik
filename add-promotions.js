const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addPromotions() {
    try {
        // Get some approved products
        const products = await prisma.product.findMany({
            where: {
                status: 'APPROVED',
                discountPrice: null
            },
            take: 15
        });

        console.log(`Found ${products.length} products to add promotions to`);

        // Add discounts to these products (10%, 15%, 20%, 25%, 30%)
        const discounts = [0.10, 0.15, 0.20, 0.25, 0.30];

        for (let i = 0; i < products.length; i++) {
            const product = products[i];
            const discountPercent = discounts[i % discounts.length];
            const discountPrice = Math.round(product.price * (1 - discountPercent));

            await prisma.product.update({
                where: { id: product.id },
                data: {
                    discountPrice: discountPrice,
                    promotionLabel: `-${Math.round(discountPercent * 100)}%`
                }
            });

            console.log(`✓ ${product.title}: ${product.price} DA → ${discountPrice} DA (-${Math.round(discountPercent * 100)}%)`);
        }

        console.log('\n✅ Promotions added successfully!');
    } catch (error) {
        console.error('Error adding promotions:', error);
    } finally {
        await prisma.$disconnect();
    }
}

addPromotions();
