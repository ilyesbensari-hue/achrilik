const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function diagnoseProductCategories() {
    console.log('=== DIAGNOSTIC DES CATÉGORIES DE PRODUITS ===\n');

    try {
        // Get all products with their category info
        const products = await prisma.product.findMany({
            select: {
                id: true,
                title: true,
                categoryId: true,
                Category: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        parent: {
                            select: {
                                id: true,
                                name: true,
                                slug: true
                            }
                        }
                    }
                }
            }
        });

        console.log(`📦 Total produits: ${products.length}\n`);

        for (const product of products) {
            console.log(`\n🔹 ${product.title}`);
            console.log(`   ID Produit: ${product.id}`);
            console.log(`   categoryId field: ${product.categoryId}`);

            if (product.Category) {
                console.log(`   ✅ Catégorie actuelle: ${product.Category.name} (${product.Category.slug})`);
                if (product.Category.parent) {
                    console.log(`      Parent: ${product.Category.parent.name} (${product.Category.parent.slug})`);
                } else {
                    console.log(`      ⚠️  Pas de parent (catégorie racine?)`);
                }
            } else {
                console.log(`   ❌ PAS DE CATÉGORIE ASSIGNÉE`);
            }
        }

        // Check for misclassified products
        console.log('\n\n=== ANALYSE DES PROBLÈMES POTENTIELS ===\n');

        // Get specific product categories mentioned in the bug report
        const homme = await prisma.category.findMany({
            where: {
                OR: [
                    { slug: 'homme' },
                    { slug: 'cat-homme' },
                    { name: 'Homme' }
                ]
            },
            include: {
                children: {
                    select: { id: true, name: true }
                }
            }
        });

        const femme = await prisma.category.findMany({
            where: {
                OR: [
                    { slug: 'femme' },
                    { slug: 'cat-femme' },
                    { name: 'Femme' }
                ]
            },
            include: {
                children: {
                    select: { id: true, name: true }
                }
            }
        });

        const robes = await prisma.category.findMany({
            where: {
                name: { contains: 'Robe' }
            },
            include: {
                parent: {
                    select: { name: true }
                }
            }
        });

        console.log('📊 Catégories Homme trouvées:', homme.length);
        homme.forEach(h => {
            console.log(`   - ${h.name} (${h.id}, slug: ${h.slug})`);
            console.log(`     Sous-catégories: ${h.children.length}`);
        });

        console.log('\n📊 Catégories Femme trouvées:', femme.length);
        femme.forEach(f => {
            console.log(`   - ${f.name} (${f.id}, slug: ${f.slug})`);
            console.log(`     Sous-catégories: ${f.children.length}`);
        });

        console.log('\n📊 Catégories  Robes trouvées:', robes.length);
        robes.forEach(r => {
            console.log(`   - ${r.name} (${r.id}, slug: ${r.slug})`);
            if (r.parent) {
                console.log(`     Parent: ${r.parent.name}`);
            }
        });

        // Check specifically the Robe product's category
        const robeProduct = products.find(p => p.title.includes('Robe'));
        if (robeProduct && robeProduct.Category) {
            console.log('\n🔍 ANALYSE ROBE KABYLE:');
            console.log(`   Catégorie assignée: ${robeProduct.Category.name} (ID: ${robeProduct.categoryId})`);

            // Get T-Shirts & Polos category IDs
            const tshirtsCats = await prisma.category.findMany({
                where: {
                    OR: [
                        { slug: 'cat-homme-tshirts' },
                        { slug: 'tshirts-polos-homme' },
                        { name: { contains: 'T-Shirts' } }
                    ]
                },
                include: {
                    children: {
                        select: { id: true, name: true }
                    },
                    parent: {
                        select: { id: true, name: true }
                    }
                }
            });

            console.log('\n📊 Catégories T-Shirts trouvées:', tshirtsCats.length);
            tshirtsCats.forEach(t => {
                console.log(`   - ${t.name} (${t.id}, slug: ${t.slug})`);
                if (t.parent) {
                    console.log(`     Parent: ${t.parent.name} (${t.parent.id})`);
                }
                console.log(`     Enfants: ${t.children.length}`);

                // Check if the robe's categoryId is in this tree
                const allIds = [t.id, ...t.children.map(c => c.id)];
                if (t.parent) allIds.push(t.parent.id);

                if (allIds.includes(robeProduct.categoryId)) {
                    console.log(`     ⚠️⚠️⚠️  LA ROBE EST ASSIGNÉE À CETTE CATÉGORIE!`);
                }
            });
        }

    } catch (error) {
        console.error('❌ Erreur:', error.message);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

diagnoseProductCategories()
    .then(() => {
        console.log('\n✅ Diagnostic terminé');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Échec du diagnostic:', error);
        process.exit(1);
    });
