
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('=== COMPLETE DATABASE AUDIT ===\n');

    // 1. Check for duplicate categories
    console.log('1. CHECKING FOR DUPLICATES...');
    const allCategories = await prisma.category.findMany({
        orderBy: { name: 'asc' }
    });

    const nameMap = {};
    const duplicates = [];

    allCategories.forEach(cat => {
        const normalized = cat.name.toLowerCase().trim();
        if (nameMap[normalized]) {
            duplicates.push({ name: cat.name, slug: cat.slug, id: cat.id, duplicate_of: nameMap[normalized] });
        } else {
            nameMap[normalized] = { name: cat.name, slug: cat.slug, id: cat.id };
        }
    });

    if (duplicates.length > 0) {
        console.log(`Found ${duplicates.length} potential duplicates:`);
        duplicates.forEach(d => console.log(`  - ${d.name} (${d.slug}) duplicates ${d.duplicate_of.name}`));
    } else {
        console.log('  ✓ No duplicates found');
    }

    // 2. Check main categories structure
    console.log('\n2. MAIN CATEGORIES STRUCTURE...');
    const mainCategories = await prisma.category.findMany({
        where: { parentId: null },
        include: {
            other_Category: {
                include: {
                    Product: { take: 1 }
                }
            }
        }
    });

    for (const main of mainCategories) {
        const productCount = await prisma.product.count({
            where: {
                Category: {
                    OR: [
                        { id: main.id },
                        { parentId: main.id }
                    ]
                }
            }
        });

        console.log(`\n${main.name} (${main.slug})`);
        console.log(`  - Subcategories: ${main.other_Category.length}`);
        console.log(`  - Total Products: ${productCount}`);
    }

    // 3. Check specific categories requested by user
    console.log('\n3. SPECIFIC CATEGORIES CHECK...');

    const targetCategories = [
        'Vêtements', 'Femme', 'Homme', 'Enfants', 'Bébé',
        'Maroquinerie', 'Accessoires'
    ];

    for (const targetName of targetCategories) {
        const cats = await prisma.category.findMany({
            where: {
                OR: [
                    { name: { equals: targetName, mode: 'insensitive' } },
                    { slug: { contains: targetName.toLowerCase(), mode: 'insensitive' } }
                ]
            },
            include: {
                other_Category: true,
                Product: { take: 3 }
            }
        });

        if (cats.length === 0) {
            console.log(`\n❌ ${targetName}: NOT FOUND`);
        } else if (cats.length > 1) {
            console.log(`\n⚠️  ${targetName}: MULTIPLE MATCHES (${cats.length})`);
            cats.forEach(c => console.log(`    - ${c.name} (${c.slug}) [${c.id}]`));
        } else {
            const cat = cats[0];
            const productCount = await prisma.product.count({
                where: { categoryId: cat.id }
            });
            console.log(`\n✓ ${targetName}: ${cat.name} (${cat.slug})`);
            console.log(`    - ID: ${cat.id}`);
            console.log(`    - Subcategories: ${cat.other_Category.length}`);
            console.log(`    - Direct Products: ${productCount}`);
        }
    }

    // 4. Check for products with newest dates
    console.log('\n4. NEWEST PRODUCTS CHECK...');
    const newest = await prisma.product.findMany({
        where: { status: 'APPROVED' },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { Category: true }
    });

    console.log('Top 5 newest products:');
    newest.forEach(p => {
        console.log(`  - ${p.title} (${p.Category?.name}) - ${p.createdAt.toISOString().split('T')[0]}`);
    });

    console.log('\n=== AUDIT COMPLETE ===');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
