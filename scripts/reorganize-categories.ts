import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function reorganizeCategories() {
    console.log('🔄 Starting category reorganization...\n');

    // 1. Get existing products and their categories
    const existingProducts = await prisma.product.findMany({
        include: { category: true }
    });

    console.log(`📊 Found ${existingProducts.length} existing products`);

    // 2. Delete all existing categories
    await prisma.category.deleteMany({});
    console.log('🗑️  Deleted old categories\n');

    // 3. Create new category hierarchy
    console.log('📁 Creating new category structure...\n');

    // === VÊTEMENTS ===
    const vetements = await prisma.category.create({
        data: { name: 'Vêtements', slug: 'vetements' }
    });
    console.log('✅ Created: Vêtements');

    // Vêtements > Homme
    const homme = await prisma.category.create({
        data: { name: 'Homme', slug: 'homme', parentId: vetements.id }
    });

    const chemisesHomme = await prisma.category.create({
        data: { name: 'Chemises Homme', slug: 'chemises-homme', parentId: homme.id }
    });

    const tshirtsHomme = await prisma.category.create({
        data: { name: 'T-shirts Homme', slug: 'tshirts-homme', parentId: homme.id }
    });

    await prisma.category.createMany({
        data: [
            { name: 'Pantalons Homme', slug: 'pantalons-homme', parentId: homme.id },
            { name: 'Pulls Homme', slug: 'pulls-homme', parentId: homme.id },
            { name: 'Vestes Homme', slug: 'vestes-homme', parentId: homme.id },
        ]
    });
    console.log('  ├─ Homme (5 subcategories)');

    // Vêtements > Femme
    const femme = await prisma.category.create({
        data: { name: 'Femme', slug: 'femme', parentId: vetements.id }
    });

    const robes = await prisma.category.create({
        data: { name: 'Robes', slug: 'robes', parentId: femme.id }
    });

    const chemisesFemme = await prisma.category.create({
        data: { name: 'Chemises Femme', slug: 'chemises-femme', parentId: femme.id }
    });

    await prisma.category.createMany({
        data: [
            { name: 'T-shirts Femme', slug: 'tshirts-femme', parentId: femme.id },
            { name: 'Pantalons Femme', slug: 'pantalons-femme', parentId: femme.id },
            { name: 'Jupes', slug: 'jupes', parentId: femme.id },
            { name: 'Pulls Femme', slug: 'pulls-femme', parentId: femme.id },
        ]
    });
    console.log('  ├─ Femme (6 subcategories)');

    // Vêtements > Enfant
    const enfant = await prisma.category.create({
        data: { name: 'Enfant', slug: 'enfant', parentId: vetements.id }
    });

    await prisma.category.createMany({
        data: [
            { name: 'T-shirts Enfant', slug: 'tshirts-enfant', parentId: enfant.id },
            { name: 'Pantalons Enfant', slug: 'pantalons-enfant', parentId: enfant.id },
            { name: 'Robes Enfant', slug: 'robes-enfant', parentId: enfant.id },
        ]
    });
    console.log('  └─ Enfant (3 subcategories)\n');

    // === ACCESSOIRES ===
    const accessoires = await prisma.category.create({
        data: { name: 'Accessoires', slug: 'accessoires' }
    });
    console.log('✅ Created: Accessoires');

    // Accessoires > Électronique
    const electronique = await prisma.category.create({
        data: { name: 'Électronique', slug: 'electronique', parentId: accessoires.id }
    });

    // Électronique > Téléphonie
    const telephonie = await prisma.category.create({
        data: { name: 'Téléphonie', slug: 'telephonie', parentId: electronique.id }
    });

    await prisma.category.createMany({
        data: [
            { name: 'Câbles', slug: 'cables', parentId: telephonie.id },
            { name: 'Chargeurs', slug: 'chargeurs', parentId: telephonie.id },
            { name: 'Coques', slug: 'coques', parentId: telephonie.id },
            { name: 'Écouteurs', slug: 'ecouteurs', parentId: telephonie.id },
        ]
    });

    // Électronique > Audio
    const audio = await prisma.category.create({
        data: { name: 'Audio', slug: 'audio', parentId: electronique.id }
    });

    await prisma.category.createMany({
        data: [
            { name: 'Enceintes', slug: 'enceintes', parentId: audio.id },
            { name: 'Casques', slug: 'casques', parentId: audio.id },
        ]
    });
    console.log('  ├─ Électronique > Téléphonie (4 subcategories)');
    console.log('  └─ Électronique > Audio (2 subcategories)');

    // Accessoires > Autres
    const montres = await prisma.category.create({
        data: { name: 'Montres', slug: 'montres', parentId: accessoires.id }
    });

    const sacs = await prisma.category.create({
        data: { name: 'Sacs', slug: 'sacs', parentId: accessoires.id }
    });

    const chaussures = await prisma.category.create({
        data: { name: 'Chaussures', slug: 'chaussures', parentId: accessoires.id }
    });
    console.log('  ├─ Montres, Sacs, Chaussures\n');

    // 4. Reassign existing products to new categories (intelligent mapping)
    console.log('🔄 Reassigning existing products to new categories...\n');

    const categoryMapping: Record<string, string> = {
        // Map old category names to new category IDs
        'chemise': chemisesHomme.id, // Default to Homme
        'chemises': chemisesHomme.id,
        't-shirt': tshirtsHomme.id,
        'tshirt': tshirtsHomme.id,
        'tshirts': tshirtsHomme.id,
        'robe': robes.id,
        'robes': robes.id,
        'montre': montres.id,
        'montres': montres.id,
        'sac': sacs.id,
        'sacs': sacs.id,
        'chaussure': chaussures.id,
        'chaussures': chaussures.id,
    };

    let reassignedCount = 0;
    for (const product of existingProducts) {
        const oldCategoryName = product.category?.slug.toLowerCase() || '';
        const newCategoryId = categoryMapping[oldCategoryName] || tshirtsHomme.id; // Default category

        try {
            await prisma.product.update({
                where: { id: product.id },
                data: { categoryId: newCategoryId }
            });
            reassignedCount++;
        } catch (error) {
            console.log(`⚠️  Could not reassign product ${product.title}`);
        }
    }

    console.log(`✅ Reassigned ${reassignedCount}/${existingProducts.length} products\n`);

    // 5. Summary
    const totalCategories = await prisma.category.count();
    console.log('═'.repeat(50));
    console.log('✨ Category reorganization complete!');
    console.log(`📊 Total categories created: ${totalCategories}`);
    console.log(`📦 Products preserved: ${existingProducts.length}`);
    console.log('═'.repeat(50));
}

reorganizeCategories()
    .catch((error) => {
        console.error('❌ Error:', error);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
