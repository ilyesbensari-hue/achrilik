const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function generateId() {
    return 'cat_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

async function main() {
    try {
        // Check if Vêtements already exists
        const existing = await prisma.category.findFirst({
            where: { name: 'Vêtements' }
        });

        let vetements;
        if (existing) {
            console.log('Vêtements already exists:', existing.id);
            vetements = existing;
        } else {
            const newId = generateId();
            console.log("Generated ID for Vêtements:", newId);

            // Create 'Vêtements' category
            vetements = await prisma.category.create({
                data: {
                    id: newId,
                    name: 'Vêtements',
                    slug: 'vetements-root-' + Date.now(),
                },
            });
            console.log('Created Vêtements:', vetements.id);
        }

        // Find target child categories - NOTE: Database has "Femmes" and "Hommes" (plural!)
        const targets = [
            { search: 'Femmes', exact: true },
            { search: 'Hommes', exact: true },
            { search: 'Enfants', exact: true }
        ];

        for (const target of targets) {
            const cat = await prisma.category.findFirst({
                where: { name: target.search }
            });

            if (cat) {
                if (cat.parentId === vetements.id) {
                    console.log(`${cat.name} already under Vêtements`);
                } else {
                    console.log(`Moving ${cat.name} (${cat.id}) to Vêtements...`);
                    await prisma.category.update({
                        where: { id: cat.id },
                        data: { parentId: vetements.id },
                    });
                    console.log(`✓ Moved ${cat.name}`);
                }
            } else {
                console.warn(`Category ${target.search} not found!`);
            }
        }

        console.log('\n✓ Migration complete.');

        // Show final structure
        console.log('\nFinal top-level categories:');
        const topLevel = await prisma.category.findMany({
            where: { parentId: null },
            select: { id: true, name: true }
        });
        topLevel.forEach(cat => console.log(`  - ${cat.name}`));

        console.log('\nVêtements children:');
        const vChildren = await prisma.category.findMany({
            where: { parentId: vetements.id },
            select: { name: true }
        });
        vChildren.forEach(cat => console.log(`  - ${cat.name}`));

    } catch (e) {
        console.error('Migration error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
