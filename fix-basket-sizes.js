const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixBasketSizes() {
    const basketProductId = 'b2d977a44d09c8010445fecfa1a8fac6';

    try {
        // 1. Delete existing variant with size "M"
        console.log('🗑️  Deleting existing variant with size "M"...');
        const deleted = await prisma.variant.deleteMany({
            where: {
                productId: basketProductId,
                size: 'M'
            }
        });
        console.log(`✅ Deleted ${deleted.count} variant(s)`);

        // 2. Create new variants with numeric sizes (36-44)
        console.log('\n👟 Creating shoe size variants (36-44)...');
        const sizes = ['36', '37', '38', '39', '40', '41', '42', '43', '44'];

        for (const size of sizes) {
            await prisma.variant.create({
                data: {
                    productId: basketProductId,
                    size: size,
                    color: '#000000',
                    stock: 10
                }
            });
            console.log(`✅ Created variant: size ${size}`);
        }

        console.log('\n✅ Successfully created 9 shoe size variants!');

        // 3. Verify the changes
        console.log('\n🔍 Verifying variants...');
        const variants = await prisma.variant.findMany({
            where: { productId: basketProductId },
            select: { id: true, size: true, color: true, stock: true }
        });

        console.log(`\nTotal variants for "Basket" product: ${variants.length}`);
        console.table(variants);

    } catch (error) {
        console.error('❌ Error fixing basket sizes:', error);
    } finally {
        await prisma.$disconnect();
    }
}

fixBasketSizes();
