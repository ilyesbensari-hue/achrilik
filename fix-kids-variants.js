const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixKidsVariants() {
    console.log('🔧 Fixing kids products without variants...\n');

    // Product identified via Prisma Studio with 0 variants
    const productWithNoVariants = {
        id: 'cuid()', // Ensemble Bebe Confort - placeholder ID
        name: 'Ensemble Bebe Confort'
    };

    // Standard kids sizes
    const sizes = ['2-3 ans', '4-5 ans', '6-7 ans', '8-9 ans', '10-11 ans', '12-13 ans'];

    try {
        // First, verify product exists
        const product = await prisma.product.findUnique({
            where: { id: productWithNoVariants.id },
            include: { Variant: true }
        });

        if (!product) {
            console.log(`⚠️  Product "${productWithNoVariants.name}" (ID: ${productWithNoVariants.id}) not found.`);
            console.log('This might be a placeholder record. Skipping...\n');
            await prisma.$disconnect();
            return;
        }

        console.log(`📦 Product: ${product.title}`);
        console.log(`   ID: ${product.id}`);
        console.log(`   Current variants: ${product.Variant.length}`);

        if (product.Variant.length > 0) {
            console.log(`✅ Product already has ${product.Variant.length} variants. Skipping...\n`);
            await prisma.$disconnect();
            return;
        }

        // Add variants
        console.log(`\n➕ Adding ${sizes.length} variants...`);
        let addedCount = 0;

        for (const size of sizes) {
            await prisma.variant.create({
                data: {
                    productId: product.id,
                    size: size,
                    color: '#FFC0CB', // Rose for baby product
                    stock: 10
                }
            });
            addedCount++;
            console.log(`   ✓ Added variant: ${size}`);
        }

        console.log(`\n✅ Successfully added ${addedCount} variants to "${product.title}"`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

fixKidsVariants();
