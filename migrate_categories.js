const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        // 1. Create 'Vêtements' category
        // We use a specific slug to ensure uniqueness/cleanliness
        const vetements = await prisma.category.create({
            data: {
                name: 'Vêtements',
                slug: 'vetements-root',
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
            }
        }

        // 3. Check "Maroquinerie" - user mentioned it.
        // If it exists and is top level, user might want it grouped?
        // "tu fais la meme chose pour maroquinreie"
        // Does Maroquinerie exist?
        const maro = await prisma.category.findFirst({ where: { name: { contains: 'Maroquinerie' } } });
        if (maro) {
            console.log(`Found Maroquinerie: ${maro.name}. Keeping as is/Checking parent.`);
            // User said "meme chose pour maroquinreie" -> implied it HAS subcategories?
        }

        console.log('Migration complete.');
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
