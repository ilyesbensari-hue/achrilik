import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addPromotions() {
    console.log('🏷️  Adding promotions to products...\n');

    try {
        // Get all products
        const products = await prisma.product.findMany({
            take: 20 // Take first 20 products
        });

        console.log(`Found ${products.length} products\n`);

        // Add promotions to every 3rd product (33% of products)
        const discounts = [10, 15, 20, 25, 30, 35, 40];
        let promoCount = 0;

        for (let i = 0; i < products.length; i++) {
            // Add promo to every 3rd product
            if (i % 3 === 0) {
                const product = products[i];
                const discount = discounts[Math.floor(Math.random() * discounts.length)];
                const discountPrice = Math.round(product.price * (1 - discount / 100));

                await prisma.product.update({
                    where: { id: product.id },
                    data: {
                        discountPrice,
                        promotionLabel: `-${discount}%`
                    }
                });

                console.log(`✅ Added ${discount}% discount to "${product.title}"`);
                console.log(`   ${product.price} DA → ${discountPrice} DA\n`);
                promoCount++;
            }
        }

        console.log(`\n🎉 Added promotions to ${promoCount} products!`);

    } catch (error) {
        console.error('❌ Error adding promotions:', error);
    } finally {
        await prisma.$disconnect();
    }
}

addPromotions();
