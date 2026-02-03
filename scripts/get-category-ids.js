const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getRealCategoryIds() {
    console.log('=== IDs RÉELS DES CATÉGORIES ===\n');

    // Get main category structure
    const categories = ['Femme', 'Homme', 'Enfant', 'Bébé (0-24 mois)', 'Maroquinerie', 'Accessoires'];

    for (const name of categories) {
        const cat = await prisma.category.findFirst({
            where: {
                OR: [
                    { name: name },
                    { name: name.replace(' (0-24 mois)', '') }
                ]
            },
            include: {
                parent: {
                    select: { name: true }
                }
            }
        });

        if (cat) {
            console.log(`${cat.name}:`);
            console.log(`  ID: ${cat.id}`);
            console.log(`  Slug: ${cat.slug}`);
            console.log(`  Parent: ${cat.parent?.name || 'Aucun (racine)'}`);
            console.log('');
        } else {
            console.log(`${name}: ❌ NON TROUVÉ\n`);
        }
    }

    await prisma.$disconnect();
}

getRealCategoryIds().catch(console.error);
