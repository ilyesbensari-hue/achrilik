const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function generateId() {
    return 'cat_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

async function main() {
    try {
        console.log('=== Cleaning up Vêtements structure ===\n');

        // 1. Delete all existing "Vêtements" categories (duplicates)
        const deletedVetements = await prisma.category.deleteMany({
            where: { name: 'Vêtements' }
        });
        console.log(`✓ Deleted ${deletedVetements.count} duplicate Vêtements categories`);

        // 2. Create ONE new Vêtements parent
        const vetements = await prisma.category.create({
            data: {
                id: generateId(),
                name: 'Vêtements',
                slug: 'vetements',
            },
        });
        console.log(`✓ Created new Vêtements parent: ${vetements.id}\n`);

        // 3. Find or create Femme, Homme, Enfant, Bébé
        const genderCategories = [
            { name: 'Femme', slug: 'femme', searchNames: ['Femme', 'Femmes'] },
            { name: 'Homme', slug: 'homme', searchNames: ['Homme', 'Hommes'] },
            { name: 'Enfant', slug: 'enfant', searchNames: ['Enfant', 'Enfants'] },
            { name: 'Bébé', slug: 'bebe', searchNames: ['Bébé', 'Bebe'] }
        ];

        for (const gender of genderCategories) {
            // Try to find existing category
            let category = null;
            for (const searchName of gender.searchNames) {
                category = await prisma.category.findFirst({
                    where: { name: searchName }
                });
                if (category) break;
            }

            if (category) {
                // Update existing to be child of Vêtements and normalize name
                await prisma.category.update({
                    where: { id: category.id },
                    data: {
                        parentId: vetements.id,
                        name: gender.name, // Normalize to singular
                        slug: gender.slug
                    },
                });
                console.log(`✓ Updated ${category.name} → ${gender.name} (child of Vêtements)`);
            } else {
                // Create new
                const newCat = await prisma.category.create({
                    data: {
                        id: generateId(),
                        name: gender.name,
                        slug: gender.slug,
                        parentId: vetements.id,
                    },
                });
                console.log(`✓ Created ${gender.name} (child of Vêtements)`);
            }
        }

        console.log('\n=== Final Structure ===');
        const topLevel = await prisma.category.findMany({
            where: { parentId: null },
            select: { id: true, name: true }
        });
        console.log('\nTop-level categories:');
        topLevel.forEach(cat => console.log(`  - ${cat.name}`));

        const vChildren = await prisma.category.findMany({
            where: { parentId: vetements.id },
            select: { name: true },
            orderBy: { name: 'asc' }
        });
        console.log('\nVêtements children:');
        vChildren.forEach(cat => console.log(`  - ${cat.name}`));

        console.log('\n✓ Migration complete!');

    } catch (e) {
        console.error('Migration error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
