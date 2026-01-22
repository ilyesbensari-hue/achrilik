const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrateTshirtCategories() {
    console.log('🔍 Starting T-shirt category migration...\n');

    try {
        // 1. Get all current categories
        const categories = await prisma.category.findMany({
            include: {
                _count: {
                    select: { products: true }
                }
            }
        });

        console.log('📊 Current categories:');
        categories.forEach(cat => {
            console.log(`  - ${cat.name} (${cat._count.products} products)${cat.parentId ? ' [child]' : ' [parent]'}`);
        });
        console.log('');

        // 2. Ensure parent categories exist (Homme, Femme, Enfant)
        const parentCategories = ['Homme', 'Femme', 'Enfant'];
        const parentCategoryIds = {};

        for (const parentName of parentCategories) {
            let parent = categories.find(c => c.name === parentName && !c.parentId);

            if (!parent) {
                console.log(`✨ Creating parent category: ${parentName}`);
                parent = await prisma.category.create({
                    data: {
                        name: parentName,
                        slug: parentName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
                    }
                });
            } else {
                console.log(`✓ Parent category exists: ${parentName}`);
            }

            parentCategoryIds[parentName] = parent.id;
        }
        console.log('');

        // 3. Find or create T-shirt subcategories under each parent
        for (const [parentName, parentId] of Object.entries(parentCategoryIds)) {
            const tshirtSlug = `${parentName.toLowerCase()}-t-shirt`;

            let tshirtCategory = categories.find(c =>
                c.slug === tshirtSlug ||
                (c.name.toLowerCase().includes('t-shirt') && c.parentId === parentId)
            );

            if (!tshirtCategory) {
                console.log(`✨ Creating T-shirt subcategory under ${parentName}`);
                tshirtCategory = await prisma.category.create({
                    data: {
                        name: 'T-shirt',
                        slug: tshirtSlug,
                        parentId: parentId,
                    }
                });
            } else {
                console.log(`✓ T-shirt subcategory exists under ${parentName}`);
            }
        }
        console.log('');

        // 4. Handle orphaned T-shirt categories (if any exist at root level)
        const orphanedTshirts = categories.filter(c =>
            (c.name.toLowerCase().includes('t-shirt') || c.slug.includes('t-shirt')) &&
            !c.parentId
        );

        if (orphanedTshirts.length > 0) {
            console.log('🔄 Found orphaned T-shirt categories, moving products...');

            for (const orphan of orphanedTshirts) {
                const products = await prisma.product.findMany({
                    where: { categoryId: orphan.id },
                    select: { id: true, title: true }
                });

                if (products.length > 0) {
                    console.log(`  - ${orphan.name}: ${products.length} products`);

                    // Try to determine gender from product titles
                    for (const product of products) {
                        const title = product.title.toLowerCase();
                        let targetParent = 'Homme'; // default

                        if (title.includes('femme') || title.includes('woman')) {
                            targetParent = 'Femme';
                        } else if (title.includes('enfant') || title.includes('kid') || title.includes('child')) {
                            targetParent = 'Enfant';
                        }

                        const targetCategorySlug = `${targetParent.toLowerCase()}-t-shirt`;
                        const targetCategory = await prisma.category.findUnique({
                            where: { slug: targetCategorySlug }
                        });

                        if (targetCategory) {
                            await prisma.product.update({
                                where: { id: product.id },
                                data: { categoryId: targetCategory.id }
                            });
                            console.log(`    ↳ Moved "${product.title}" to ${targetParent} > T-shirt`);
                        }
                    }
                }

                // Delete empty orphaned category
                const remainingProducts = await prisma.product.count({
                    where: { categoryId: orphan.id }
                });

                if (remainingProducts === 0) {
                    await prisma.category.delete({
                        where: { id: orphan.id }
                    });
                    console.log(`    ✓ Deleted orphaned category: ${orphan.name}`);
                }
            }
        }
        console.log('');

        // 5. Final summary
        const finalCategories = await prisma.category.findMany({
            include: {
                _count: {
                    select: { products: true, children: true }
                },
                parent: {
                    select: { name: true }
                }
            },
            orderBy: [
                { parentId: 'asc' },
                { name: 'asc' }
            ]
        });

        console.log('📊 Final category structure:');
        const rootCategories = finalCategories.filter(c => !c.parentId);

        for (const root of rootCategories) {
            console.log(`\n${root.name} (${root._count.products} products, ${root._count.children} subcategories)`);
            const children = finalCategories.filter(c => c.parentId === root.id);
            for (const child of children) {
                console.log(`  └─ ${child.name} (${child._count.products} products)`);
            }
        }

        console.log('\n✅ T-shirt category migration completed successfully!');

    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

migrateTshirtCategories();
