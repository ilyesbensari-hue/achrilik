const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testBebeCategory() {
    console.log("🧪 Test: Récupération produits catégorie Bébé\n");

    // 1. Vérifier la structure de la catégorie
    const bebeCategory = await prisma.category.findFirst({
        where: { slug: 'bebe' },
        include: { parent: true }
    });
    console.log("📁 Catégorie Bébé:", JSON.stringify(bebeCategory, null, 2));

    if (!bebeCategory) {
        console.log("❌ ERREUR: Catégorie Bébé introuvable");
        return;
    }

    // 2. Récupérer tous les IDs descendants (comme dans getCategoryProducts)
    async function getAllDescendantCategoryIds(categoryId) {
        const childCategories = await prisma.category.findMany({
            where: { parentId: categoryId },
            select: { id: true }
        });

        if (childCategories.length === 0) return [categoryId];

        const descendantIds = await Promise.all(
            childCategories.map(child => getAllDescendantCategoryIds(child.id))
        );

        return [categoryId, ...descendantIds.flat()];
    }

    const categoryIds = await getAllDescendantCategoryIds(bebeCategory.id);
    console.log("\n🔍 IDs recherchés (avec descendants):", categoryIds);

    // 3. Compter les produits
    const products = await prisma.product.findMany({
        where: {
            categoryId: { in: categoryIds },
            status: 'APPROVED'
        },
        select: {
            id: true,
            title: true,
            Category: { select: { name: true, slug: true } }
        }
    });

    console.log(`\n✅ ${products.length} produit(s) trouvé(s):`);
    products.forEach(p => console.log(`   - ${p.title} (${p.Category.name})`));

    if (products.length === 0) {
        console.log("\n⚠️  ATTENTION: Aucun produit trouvé pour la catégorie Bébé");
        console.log("   Cause possible: Aucun produit APPROVED dans cette catégorie");
    } else {
        console.log("\n✅ SUCCESS: Produits Bébé récupérés correctement");
    }
}

testBebeCategory()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
