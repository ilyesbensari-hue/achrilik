const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function finalizeUnification() {
    try {
        console.log('🔄 Finalizing category unification...\n');

        // Find main Vêtements category
        const mainVetements = await prisma.category.findFirst({
            where: { name: 'Vêtements', slug: 'vetements', parentId: null }
        });

        if (!mainVetements) {
            console.error('❌ Main "Vêtements" category not found!');
            return;
        }

        console.log(`✅ Found main Vêtements category: ${mainVetements.id}`);

        // Find "Vêtements Enfants" root
        const enfantsRoot = await prisma.category.findFirst({
            where: {
                name: 'Vêtements Enfants',
                parentId: null
            },
            include: {
                children: true
            }
        });

        if (!enfantsRoot) {
            console.log('✅ No separate "Vêtements Enfants" root found - already unified!');
            return;
        }

        console.log(`\n📋 Found "Vêtements Enfants" root with ${enfantsRoot.children.length} children`);

        // Check if "Enfant" already exists under main Vêtements
        let targetEnfant = await prisma.category.findFirst({
            where: {
                parentId: mainVetements.id,
                OR: [
                    { name: 'Enfant' },
                    { name: 'Enfant & Bébé' }
                ]
            }
        });

        if (!targetEnfant) {
            // Create "Enfant & Bébé" category under main Vêtements
            targetEnfant = await prisma.category.create({
                data: {
                    name: 'Enfant & Bébé',
                    slug: 'enfant-bebe',
                    parentId: mainVetements.id,
                    description: 'Vêtements pour enfants et bébés',
                    icon: '👶',
                    order: 3,
                    isActive: true
                }
            });
            console.log(`\n✅ Created "Enfant & Bébé" category under Vêtements`);
        } else {
            console.log(`\n✅ Found existing "${targetEnfant.name}" category`);
        }

        // Move all children from "Vêtements Enfants" to "Enfant & Bébé"
        const childrenCount = await prisma.category.updateMany({
            where: { parentId: enfantsRoot.id },
            data: { parentId: targetEnfant.id }
        });
        console.log(`✅ Moved ${childrenCount.count} subcategories`);

        // Move all products
        const productsCount = await prisma.product.updateMany({
            where: { categoryId: enfantsRoot.id },
            data: { categoryId: targetEnfant.id }
        });
        console.log(`✅ Moved ${productsCount.count} products`);

        // Delete old root
        await prisma.category.delete({
            where: { id: enfantsRoot.id }
        });
        console.log(`✅ Deleted old "Vêtements Enfants" root`);

        console.log('\n✅ Final unification complete!');

        // Show final structure
        const finalStructure = await prisma.category.findMany({
            where: { parentId: null },
            include: {
                children: {
                    select: { name: true }
                }
            },
            orderBy: { name: 'asc' }
        });

        console.log('\n📊 Final root categories:');
        finalStructure.forEach(cat => {
            console.log(`  ${cat.name} (${cat.children.length} children)`);
        });

    } catch (error) {
        console.error('❌ Error:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

finalizeUnification();
