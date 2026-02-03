
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const fixes = [
        {
            id: 'cmkixab6q001a13cjowl2ma6h',
            title: 'Montre Sport - Oran',
            targetCategoryId: 'cmkmuju71001313mn0d2so9vh', // Montres
        },
        {
            id: 'cmkixaef4002e13cj1f118rg3',
            title: 'Montre Sport - Annaba',
            targetCategoryId: 'cmkmuju71001313mn0d2so9vh', // Montres
        },
        {
            id: 'cmkiyylh30008s0hufkb31bl0',
            title: 'Coque iPhone 14/15 Transparente',
            targetCategoryId: 'cmkmujtgb000w13mn6aom80y3', // Coques
        },
        {
            id: 'cmkiyynxr000ts0hunikavhpy',
            title: 'Écouteurs Sans Fil Pro',
            targetCategoryId: '76cb4c4933fe552295ea86217518bb1e', // Écouteurs sans fil
        },
        {
            id: 'cmkiyymzw000ls0huoqxvt8ce',
            title: 'Smartwatch Series 8 Ultra',
            targetCategoryId: 'cmkmuju71001313mn0d2so9vh', // Montres
        }
    ];

    console.log('Applying bulk category fixes...\n');

    for (const fix of fixes) {
        try {
            // Get current category name for logging
            const product = await prisma.product.findUnique({
                where: { id: fix.id },
                include: { Category: true }
            });

            if (!product) {
                console.log(`[SKIP] Product ${fix.id} not found.`);
                continue;
            }

            await prisma.product.update({
                where: { id: fix.id },
                data: { categoryId: fix.targetCategoryId }
            });

            console.log(`[FIXED] "${product.title}"`);
            console.log(`  Moved from: ${product.Category?.name}`);
            console.log(`  Moved to:   ${fix.targetCategoryId} (Target Category)\n`);
        } catch (error) {
            console.error(`[ERROR] Failed to update product ${fix.id}:`, error);
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
