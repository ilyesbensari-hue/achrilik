const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('=== ANALYZING CATEGORY STRUCTURE ===\n');

        // Get all categories
        const allCategories = await prisma.category.findMany({
            select: { id: true, name: true, slug: true, parentId: true }
        });

        console.log(`Total categories: ${allCategories.length}\n`);

        // Show root categories
        const roots = allCategories.filter(c => !c.parentId);
        console.log('ROOT CATEGORIES:');
        roots.forEach(root => {
            console.log(`  📁 ${root.name} (${root.slug})`);
        });

        // Show Vêtements hierarchy if exists
        const vetements = allCategories.find(c => c.name.toLowerCase().includes('vêtement') || c.name.toLowerCase().includes('vetement'));
        if (vetements) {
            console.log(`\n\n=== VÊTEMENTS HIERARCHY ===`);
            console.log(`Root: ${vetements.name} (ID: ${vetements.id})`);

            const children = allCategories.filter(c => c.parentId === vetements.id);
            console.log(`\nDirect children (${children.length}):`);
            children.forEach(child => {
                console.log(`  ├─ ${child.name} (${child.slug})`);
                const grandchildren = allCategories.filter(c => c.parentId === child.id);
                if (grandchildren.length > 0) {
                    grandchildren.forEach(gc => {
                        console.log(`     └─ ${gc.name} (${gc.slug})`);
                    });
                }
            });
        }

        // Check for duplicate gender categories
        console.log('\n\n=== CHECKING FOR DUPLICATES ===');
        const genderNames = ['Homme', 'Hommes', 'Femme', 'Femmes', 'Enfant', 'Enfants', 'Bébé', 'Bebe'];
        genderNames.forEach(name => {
            const matches = allCategories.filter(c => c.name === name);
            if (matches.length > 0) {
                console.log(`${name}: ${matches.length} found`);
                matches.forEach(m => console.log(`  - ID: ${m.id}, Parent: ${m.parentId || 'ROOT'}`));
            }
        });

        // Check products with "robe"
        console.log('\n\n=== PRODUCTS WITH "ROBE" ===');
        const robes = await prisma.product.findMany({
            where: { title: { contains: 'robe', mode: 'insensitive' } },
            select: {
                id: true,
                title: true,
                categoryId: true,
                promotionLabel: true,
                isNew: true,
                Category: { select: { name: true } }
            },
            take: 10
        });

        console.log(`Found ${robes.length} products:`);
        robes.forEach(p => {
            console.log(`  - "${p.title}"`);
            console.log(`    Category: ${p.Category?.name || 'NONE'}`);
            console.log(`    Promo: ${p.promotionLabel || 'NONE'}`);
            console.log(`    isNew: ${p.isNew}`);
        });

        // Check products with promotionLabel
        console.log('\n\n=== PRODUCTS WITH PROMOTION LABELS ===');
        const promos = await prisma.product.findMany({
            where: {
                promotionLabel: { not: null }
            },
            select: {
                title: true,
                promotionLabel: true,
                Category: { select: { name: true } }
            },
            take: 10
        });

        console.log(`Found ${promos.length} products with promotion labels:`);
        promos.forEach(p => {
            console.log(`  - "${p.title}" → ${p.promotionLabel} (${p.Category?.name || 'No category'})`);
        });

        // Check products with isNew badge
        console.log('\n\n=== PRODUCTS WITH "NEW" BADGE ===');
        const newProducts = await prisma.product.findMany({
            where: { isNew: true },
            select: {
                title: true,
                Category: { select: { name: true } }
            },
            take: 10
        });

        console.log(`Found ${newProducts.length} products marked as NEW:`);
        newProducts.forEach(p => {
            console.log(`  - "${p.title}" (${p.Category?.name || 'No category'})`);
        });

        console.log('\n\n=== ANALYSIS COMPLETE ===');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
