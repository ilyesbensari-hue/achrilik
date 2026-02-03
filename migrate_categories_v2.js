const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { v4: uuidv4 } = require('crypto'); // Built-in node module or fallback

// Simple ID generator if uuid not available easily without install
function generateId() {
    return 'cat_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

async function main() {
    try {
        const newId = generateId();
        console.log("Generated ID:", newId);

        // 1. Create 'Vêtements' category
        const vetements = await prisma.category.create({
            data: {
                id: newId,
                name: 'Vêtements',
                slug: 'vetements-root-' + Date.now(),
            },
        });
        console.log('Created Vêtements:', vetements.id);

        // 2. Find target child categories
        const targets = ['Femme', 'Homme', 'Enfants'];

        for (const name of targets) {
            const cat = await prisma.category.findFirst({ where: { name: name } });
            if (cat) {
                console.log(`Moving ${name} (${cat.id}) to Vêtements...`);
                await prisma.category.update({
                    where: { id: cat.id },
                    data: { parentId: vetements.id },
                });
            } else {
                console.warn(`Category ${name} not found!`);
                // If Enfants doesn't exist, maybe it's "Bébé"?
                if (name === 'Enfants') {
                    const bebe = await prisma.category.findFirst({ where: { name: 'Bébé' } });
                    if (bebe) {
                        console.log(`Moving Bébé (${bebe.id}) to Vêtements...`);
                        await prisma.category.update({
                            where: { id: bebe.id },
                            data: { parentId: vetements.id },
                        });
                    }
                }
            }
        }

        console.log('Migration complete.');
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
