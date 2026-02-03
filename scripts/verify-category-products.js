const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyCategoryProducts() {
    console.log('=== VÉRIFICATION DES PRODUITS PAR CATÉGORIE ===\n');

    try {
        // 1. Get all categories with product counts
        const categories = await prisma.category.findMany({
            include: {
                _count: {
                    select: { products: true }
                },
                parent: {
                    select: { id: true, name: true }
                }
            },
            orderBy: { name: 'asc' }
        });

        // 2. Group by hierarchy
        const rootCategories = categories.filter(c => !c.parentId);

        console.log('📊 STRUCTURE HIÉRARCHIQUE DES CATÉGORIES:\n');

        for (const root of rootCategories) {
            const productCount = root._count.products;
            console.log(`📁 ${root.name} (ID: ${root.id})`);
            console.log(`   └─ Produits directs: ${productCount}`);

            // Find children
            const children = categories.filter(c => c.parentId === root.id);

            for (const child of children) {
                const childProductCount = child._count.products;
                console.log(`   ├─ ${child.name} (ID: ${child.id})`);
                console.log(`   │  └─ Produits: ${childProductCount}`);

                // Find grandchildren
                const grandchildren = categories.filter(c => c.parentId === child.id);

                for (const grandchild of grandchildren) {
                    const grandchildProductCount = grandchild._count.products;
                    console.log(`   │  ├─ ${grandchild.name} (ID: ${grandchild.id})`);
                    console.log(`   │  │  └─ Produits: ${grandchildProductCount}`);
                }
            }
            console.log('');
        }

        // 3. Statistics
        const totalProducts = await prisma.product.count();
        const productsWithCategory = await prisma.product.count({
            where: { categoryId: { not: null } }
        });
        const productsWithoutCategory = totalProducts - productsWithCategory;

        console.log('\n=== STATISTIQUES GLOBALES ===');
        console.log(`📦 Total produits: ${totalProducts}`);
        console.log(`✅ Produits avec catégorie: ${productsWithCategory}`);
        console.log(`❌ Produits sans catégorie: ${productsWithoutCategory}`);

        // 4. List products without category
        if (productsWithoutCategory > 0) {
            console.log('\n⚠️  PRODUITS SANS CATÉGORIE:');
            const orphanProducts = await prisma.product.findMany({
                where: { categoryId: null },
                select: {
                    id: true,
                    title: true,
                    storeId: true
                },
                take: 10
            });

            orphanProducts.forEach(p => {
                console.log(`   - ${p.title} (ID: ${p.id}, Boutique: ${p.storeId})`);
            });

            if (productsWithoutCategory > 10) {
                console.log(`   ... et ${productsWithoutCategory - 10} autres`);
            }
        }

        // 5. Check for empty leaf categories
        console.log('\n=== CATÉGORIES FEUILLES VIDES ===');
        const leafCategories = categories.filter(c => {
            const hasChildren = categories.some(child => child.parentId === c.id);
            return !hasChildren && c._count.products === 0;
        });

        if (leafCategories.length > 0) {
            console.log('⚠️  Catégories feuilles sans produits:');
            leafCategories.forEach(cat => {
                const parentName = cat.parent ? cat.parent.name : 'Racine';
                console.log(`   - ${cat.name} (Parent: ${parentName})`);
            });
        } else {
            console.log('✅ Toutes les catégories feuilles contiennent des produits');
        }

        // 6. Sample products by category
        console.log('\n=== ÉCHANTILLONS DE PRODUITS PAR CATÉGORIE ===');
        const categoriesWithProducts = categories.filter(c => c._count.products > 0);

        for (const cat of categoriesWithProducts.slice(0, 5)) {
            const products = await prisma.product.findMany({
                where: { categoryId: cat.id },
                select: { id: true, title: true },
                take: 3
            });

            console.log(`\n${cat.name} (${cat._count.products} produits):`);
            products.forEach(p => {
                console.log(`   - ${p.title} (${p.id})`);
            });
            if (cat._count.products > 3) {
                console.log(`   ... et ${cat._count.products - 3} autres`);
            }
        }

    } catch (error) {
        console.error('❌ Erreur:', error.message);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

verifyCategoryProducts()
    .then(() => {
        console.log('\n✅ Vérification terminée');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Échec de la vérification:', error);
        process.exit(1);
    });
