const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function unifyCategories() {
    try {
        console.log('🔍 Analyzing category structure...\n');

        // Find all root categories (parentId = null)
        const rootCategories = await prisma.category.findMany({
            where: { parentId: null },
            include: {
                children: {
                    include: {
                        children: true
                    }
                }
            },
            orderBy: { name: 'asc' }
        });

        console.log('Current root categories:');
        rootCategories.forEach(cat => {
            console.log(`  - ${cat.name} (${cat.children.length} children)`);
        });

        // Find duplicated "Vêtements" roots
        const vetementRoots = rootCategories.filter(c =>
            c.name.toLowerCase().includes('vêtement') ||
            c.name.toLowerCase().includes('vetement') ||
            c.name === 'Vêtements Femme' ||
            c.name === 'Vêtements Homme' ||
            c.name === 'Vêtements Enfants'
        );

        console.log(`\n📋 Found ${vetementRoots.length} "Vêtements" related roots:`);
        vetementRoots.forEach(cat => {
            console.log(`  - ${cat.name} (slug: ${cat.slug}, id: ${cat.id})`);
        });

        // Find or create main "Vêtements" category
        let mainVetements = rootCategories.find(c => c.name === 'Vêtements' && c.slug === 'vetements');

        if (!mainVetements) {
            console.log('\n🆕 Creating main "Vêtements" category...');
            mainVetements = await prisma.category.create({
                data: {
                    name: 'Vêtements',
                    slug: 'vetements',
                    description: 'Tous les vêtements pour femme, homme, enfant et bébé',
                    icon: '👗',
                    order: 0,
                    isActive: true,
                    isFeatured: true
                }
            });
            console.log(`✅ Created main category: ${mainVetements.name} (${mainVetements.id})`);
        } else {
            console.log(`\n✅ Main "Vêtements" category already exists (${mainVetements.id})`);
        }

        // Find "Vêtements Femme" and "Vêtements Homme" roots to merge
        const femmesRoot = rootCategories.find(c => c.name === 'Vêtements Femme' || c.slug === 'femmes');
        const hommesRoot = rootCategories.find(c => c.name === 'Vêtements Homme' || c.slug === 'hommes');

        // Check if "Femme" and "Homme" already exist as children of main Vêtements
        const existingFemme = await prisma.category.findFirst({
            where: {
                parentId: mainVetements.id,
                OR: [
                    { name: 'Femme' },
                    { slug: 'femme' }
                ]
            }
        });

        const existingHomme = await prisma.category.findFirst({
            where: {
                parentId: mainVetements.id,
                OR: [
                    { name: 'Homme' },
                    { slug: 'homme' }
                ]
            }
        });

        // Merge "Vêtements Femme" root into "Vêtements > Femme"
        if (femmesRoot && femmesRoot.id !== mainVetements.id) {
            console.log(`\n🔄 Merging "${femmesRoot.name}" into "Vêtements > Femme"...`);

            let targetFemme = existingFemme;
            if (!targetFemme) {
                // Create "Femme" as child of main Vêtements
                targetFemme = await prisma.category.create({
                    data: {
                        name: 'Femme',
                        slug: 'femme',
                        parentId: mainVetements.id,
                        description: 'Mode féminine',
                        icon: '👩',
                        order: 1,
                        isActive: true
                    }
                });
                console.log(`  ✅ Created "Femme" category under Vêtements`);
            }

            // Move all children of femmesRoot to targetFemme
            const childrenCount = await prisma.category.updateMany({
                where: { parentId: femmesRoot.id },
                data: { parentId: targetFemme.id }
            });
            console.log(`  ✅ Moved ${childrenCount.count} subcategories`);

            // Move all products from femmesRoot to targetFemme
            const productsCount = await prisma.product.updateMany({
                where: { categoryId: femmesRoot.id },
                data: { categoryId: targetFemme.id }
            });
            console.log(`  ✅ Moved ${productsCount.count} products`);

            // Delete the old root
            await prisma.category.delete({
                where: { id: femmesRoot.id }
            });
            console.log(`  ✅ Deleted old "${femmesRoot.name}" root`);
        }

        // Merge "Vêtements Homme" root into "Vêtements > Homme"
        if (hommesRoot && hommesRoot.id !== mainVetements.id) {
            console.log(`\n🔄 Merging "${hommesRoot.name}" into "Vêtements > Homme"...`);

            let targetHomme = existingHomme;
            if (!targetHomme) {
                // Create "Homme" as child of main Vêtements
                targetHomme = await prisma.category.create({
                    data: {
                        name: 'Homme',
                        slug: 'homme',
                        parentId: mainVetements.id,
                        description: 'Mode masculine',
                        icon: '👨',
                        order: 2,
                        isActive: true
                    }
                });
                console.log(`  ✅ Created "Homme" category under Vêtements`);
            }

            // Move all children of hommesRoot to targetHomme
            const childrenCount = await prisma.category.updateMany({
                where: { parentId: hommesRoot.id },
                data: { parentId: targetHomme.id }
            });
            console.log(`  ✅ Moved ${childrenCount.count} subcategories`);

            // Move all products from hommesRoot to targetHomme
            const productsCount = await prisma.product.updateMany({
                where: { categoryId: hommesRoot.id },
                data: { categoryId: targetHomme.id }
            });
            console.log(`  ✅ Moved ${productsCount.count} products`);

            // Delete the old root
            await prisma.category.delete({
                where: { id: hommesRoot.id }
            });
            console.log(`  ✅ Deleted old "${hommesRoot.name}" root`);
        }

        console.log('\n✅ Category unification complete!');

        // Show final structure
        const finalRoots = await prisma.category.findMany({
            where: { parentId: null },
            include: {
                children: {
                    select: {
                        name: true,
                        _count: {
                            select: { children: true, products: true }
                        }
                    }
                }
            },
            orderBy: { name: 'asc' }
        });

        console.log('\n📊 Final root categories:');
        finalRoots.forEach(cat => {
            console.log(`\n  ${cat.name} (${cat.children.length} children):`);
            cat.children.forEach(child => {
                console.log(`    - ${child.name} (${child._count.children} subcats, ${child._count.products} products)`);
            });
        });

    } catch (error) {
        console.error('❌ Error unifying categories:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

unifyCategories();
