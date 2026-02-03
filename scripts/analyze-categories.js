const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('=== ANALYZING CATEGORY STRUCTURE ===\n');

        // Get all categories
        const allCategories = await prisma.category.findMany({
            select: {
                id: true,
                name: true,
                slug: true,
                parentId: true,
                _count: {
                    select: { products: true }
                }
            }
        });

        console.log(`Total categories: ${allCategories.length}\n`);

        // Show root categories
        const roots = allCategories.filter(c => !c.parentId);
        console.log('ROOT CATEGORIES:');
        roots.forEach(root => {
            console.log(`  📁 ${root.name} (${root._count.products} produits)`);

            // Show children
            const children = allCategories.filter(c => c.parentId === root.id);
            children.forEach(child => {
                console.log(`     ├─ ${child.name} (${child._count.products} produits)`);

                // Show grandchildren
                const grandchildren = allCategories.filter(c => c.parentId === child.id);
                grandchildren.forEach(gc => {
                    console.log(`        └─ ${gc.name} (${gc._count.products} produits)`);
                });
            });
        });

        // Check for potential duplicates
        console.log('\n\n=== CHECKING FOR DUPLICATES ===');
        const genderNames = ['Homme', 'Hommes', 'Femme', 'Femmes', 'Enfant', 'Enfants', 'Bébé', 'Bebe'];
        genderNames.forEach(name => {
            const matches = allCategories.filter(c => c.name === name);
            if (matches.length > 0) {
                console.log(`${name}: ${matches.length} found`);
                matches.forEach(m => console.log(`  - ID: ${m.id.substring(0, 8)}..., Parent: ${m.parentId ? m.parentId.substring(0, 8) + '...' : 'ROOT'}, Products: ${m._count.products}`));
            }
        });

        console.log('\n\n=== PRODUCTS ANALYSIS ===');

        // Products with "robe"
        const robesCount = await prisma.product.count({
            where: { title: { contains: 'robe', mode: 'insensitive' } }
        });
        console.log(`Products with "robe": ${robesCount}`);

        // Products with promotionLabel
        const promosCount = await prisma.product.count({
            where: { promotionLabel: { not: null } }
        });
        console.log(`Products with promotion labels: ${promosCount}`);

        // Products with isNew badge
        const newCount = await prisma.product.count({
            where: { isNew: true }
        });
        console.log(`Products marked as NEW: ${newCount}`);

        // Products without category
        const noCategoryCount = await prisma.product.count({
            where: { categoryId: null }
        });
        console.log(`Products without category: ${noCategoryCount}`);

        console.log('\n=== ANALYSIS COMPLETE ===');

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
