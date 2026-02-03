
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugCategory(categoryId, categoryName) {
    console.log(`\n=== Debugging ${categoryName} (${categoryId}) ===`);

    // 1. Check category exists
    const category = await prisma.category.findUnique({
        where: { id: categoryId }
    });

    if (!category) {
        console.log('❌ Category not found!');
        return;
    }

    console.log(`✓ Category found: ${category.name} (${category.slug})`);

    // 2. Check direct products
    const directProducts = await prisma.product.findMany({
        where: {
            categoryId: categoryId,
            status: 'APPROVED'
        }
    });

    console.log(`Direct products: ${directProducts.length}`);
    if (directProducts.length > 0) {
        directProducts.forEach(p => console.log(`  - ${p.title}`));
    }

    // 3. Check child categories
    const childCategories = await prisma.category.findMany({
        where: { parentId: categoryId }
    });

    console.log(`Child categories: ${childCategories.length}`);
    childCategories.forEach(c => console.log(`  - ${c.name} (${c.id})`));

    // 4. Check products in child categories
    if (childCategories.length > 0) {
        const childIds = childCategories.map(c => c.id);
        const childProducts = await prisma.product.findMany({
            where: {
                categoryId: { in: childIds },
                status: 'APPROVED'
            }
        });

        console.log(`Products in child categories: ${childProducts.length}`);
        if (childProducts.length > 0) {
            childProducts.forEach(p => console.log(`  - ${p.title} (in ${p.categoryId})`));
        }
    }

    // 5. Total products (direct + children)
    const allCategoryIds = [categoryId, ...childCategories.map(c => c.id)];
    const totalProducts = await prisma.product.findMany({
        where: {
            categoryId: { in: allCategoryIds },
            status: 'APPROVED'
        }
    });

    console.log(`\nTOTAL PRODUCTS (direct + children): ${totalProducts.length}`);
}

async function main() {
    await debugCategory('35f50c60d2e8ca01b4562532f6092687', 'Maroquinerie');
    await debugCategory('da83e20dabec64d4bd778ffb7b43cfa6', 'Bébé');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
