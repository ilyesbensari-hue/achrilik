const { PrismaClient } = require('@prisma/client');
const { randomBytes } = require('crypto');
const prisma = new PrismaClient();

function generateId() {
    return randomBytes(16).toString('hex');
}

async function createShoesStructure() {
    console.log('🚀 Création structure Chaussures...\n');

    try {
        // 1. Catégorie Top-Level "Chaussures"
        console.log('1️⃣ Création catégorie principale...');
        const topLevel = await prisma.category.upsert({
            where: { slug: 'chaussures' },
            update: {},
            create: {
                id: generateId(),
                name: 'Chaussures',
                slug: 'chaussures',
                description: 'Toutes nos chaussures pour Homme, Femme et Enfant',
                icon: '👟'
            }
        });
        console.log(`✅ ${topLevel.name} (${topLevel.id})`);

        // 2. Chaussures Homme
        console.log('\n2️⃣ Création Chaussures Homme...');
        const homme = await prisma.category.upsert({
            where: { slug: 'chaussures-hommes' },
            update: {},
            create: {
                id: generateId(),
                name: 'Chaussures Homme',
                slug: 'chaussures-hommes',
                description: 'Chaussures pour Homme',
                parentId: topLevel.id,
                icon: '👞'
            }
        });
        console.log(`✅ ${homme.name}`);

        // 3. Sous-catégories Homme
        console.log('\n3️⃣ Sous-catégories Homme...');
        const hommeSubcats = [
            { name: 'Baskets', slug: 'baskets-homme' },
            { name: 'Souliers', slug: 'souliers-homme' },
            { name: 'Sandales', slug: 'sandales-homme' },
            { name: 'Sport', slug: 'sport-homme' }
        ];

        for (const subcat of hommeSubcats) {
            const created = await prisma.category.upsert({
                where: { slug: subcat.slug },
                update: {},
                create: {
                    id: generateId(),
                    name: subcat.name,
                    slug: subcat.slug,
                    parentId: homme.id
                }
            });
            console.log(`  ✅ ${created.name}`);
        }

        // 4. Chaussures Femme
        console.log('\n4️⃣ Création Chaussures Femme...');
        const femme = await prisma.category.upsert({
            where: { slug: 'chaussures-femmes' },
            update: {},
            create: {
                id: generateId(),
                name: 'Chaussures Femme',
                slug: 'chaussures-femmes',
                description: 'Chaussures pour Femme',
                parentId: topLevel.id,
                icon: '👠'
            }
        });
        console.log(`✅ ${femme.name}`);

        // 5. Sous-catégories Femme
        console.log('\n5️⃣ Sous-catégories Femme...');
        const femmeSubcats = [
            { name: 'Baskets', slug: 'baskets-femme' },
            { name: 'Escarpins', slug: 'escarpins-femme' },
            { name: 'Sandales', slug: 'sandales-femme' },
            { name: 'Bottes', slug: 'bottes-femme' }
        ];

        for (const subcat of femmeSubcats) {
            const created = await prisma.category.upsert({
                where: { slug: subcat.slug },
                update: {},
                create: {
                    id: generateId(),
                    name: subcat.name,
                    slug: subcat.slug,
                    parentId: femme.id
                }
            });
            console.log(`  ✅ ${created.name}`);
        }

        // 6. Chaussures Enfant
        console.log('\n6️⃣ Création Chaussures Enfant...');
        const enfant = await prisma.category.upsert({
            where: { slug: 'chaussures-enfants' },
            update: {},
            create: {
                id: generateId(),
                name: 'Chaussures Enfant',
                slug: 'chaussures-enfants',
                description: 'Chaussures pour Enfant et Bébé',
                parentId: topLevel.id,
                icon: '👶'
            }
        });
        console.log(`✅ ${enfant.name}`);

        console.log('\n✨ Structure créée avec succès !');

        // 7. Vérifier produits chaussures existants
        console.log('\n7️⃣ Recherche produits chaussures...');
        const shoeProducts = await prisma.product.findMany({
            where: {
                OR: [
                    { title: { contains: 'basket', mode: 'insensitive' } },
                    { title: { contains: 'chaussure', mode: 'insensitive' } },
                    { title: { contains: 'soulier', mode: 'insensitive' } }
                ]
            },
            include: { Category: true }
        });

        console.log(`\n👟 ${shoeProducts.length} produit(s) trouvé(s):`);
        shoeProducts.forEach(p => {
            console.log(`  - ${p.title} (${p.Category?.name || 'Sans catégorie'})`);
            console.log(`    ID: ${p.id}`);
        });

        // Retourner IDs pour migration
        return {
            basketsHommeId: (await prisma.category.findUnique({ where: { slug: 'baskets-homme' } }))?.id,
            products: shoeProducts
        };

    } catch (error) {
        console.error('❌ Erreur:', error.message);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

createShoesStructure()
    .then(result => {
        if (result.products.length > 0) {
            console.log('\n📌 Pour déplacer les produits, exécuter:');
            result.products.forEach(p => {
                console.log(`npx prisma db execute --stdin <<< "UPDATE \\"Product\\" SET \\"categoryId\\" = '${result.basketsHommeId}' WHERE id = '${p.id}';"`);
            });
        }
    })
    .catch(err => {
        console.error('Failed:', err);
        process.exit(1);
    });
