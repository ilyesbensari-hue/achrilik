const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function removeEmptyCategories() {
    console.log('🔍 Searching for empty categories...\n');

    // Get all categories
    const allCategories = await prisma.category.findMany({
        include: {
            Product: true,
            _count: {
                select: {
                    Product: true
                }
            }
        }
    });

    // Function to check if a category has any products (including in descendants)
    const hasProductsRecursive = (categoryId, categories) => {
        const category = categories.find(c => c.id === categoryId);
        if (!category) return false;

        // Has direct products?
        if (category.Product.length > 0) return true;

        // Check children
        const children = categories.filter(c => c.parentId === categoryId);
        for (const child of children) {
            if (hasProductsRecursive(child.id, categories)) return true;
        }

        return false;
    };

    // Find categories to delete (no products and no children with products)
    const categoriesToDelete = [];
    for (const category of allCategories) {
        if (!hasProductsRecursive(category.id, allCategories)) {
            categoriesToDelete.push(category);
        }
    }

    console.log(`Found ${categoriesToDelete.length} empty categories:\n`);
    categoriesToDelete.forEach(cat => {
        console.log(`  - ${cat.name} (ID: ${cat.id})`);
    });

    if (categoriesToDelete.length === 0) {
        console.log('\n✅ No empty categories found!');
        await prisma.$disconnect();
        return;
    }

    console.log('\n🗑️  Deleting empty categories...\n');

    // Delete from leaf to root to avoid foreign key issues
    let deleted = 0;
    while (categoriesToDelete.length > 0) {
        // Find categories with no children in the to-delete list
        const leafCategories = categoriesToDelete.filter(cat => {
            const hasChildrenToDelete = categoriesToDelete.some(c => c.parentId === cat.id);
            return !hasChildrenToDelete;
        });

        if (leafCategories.length === 0) break; // Safety check

        for (const cat of leafCategories) {
            await prisma.category.delete({
                where: { id: cat.id }
            });
            console.log(`  ✓ Deleted: ${cat.name}`);
            deleted++;

            // Remove from list
            const index = categoriesToDelete.indexOf(cat);
            categoriesToDelete.splice(index, 1);
        }
    }

    console.log(`\n✅ Successfully deleted ${deleted} empty categories!`);

    // Show remaining category structure
    console.log('\n📊 Remaining category structure:\n');
    const remaining = await prisma.category.findMany({
        include: {
            _count: {
                select: {
                    Product: true
                }
            }
        },
        orderBy: {
            name: 'asc'
        }
    });

    remaining.forEach(cat => {
        const indent = cat.parentId ? '  ' : '';
        console.log(`${indent}${cat.name} (${cat._count.Product} products)`);
    });

    await prisma.$disconnect();
}

removeEmptyCategories()
    .catch(error => {
        console.error('Error:', error);
        process.exit(1);
    });
