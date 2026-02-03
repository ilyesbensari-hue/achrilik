
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // Define keywords that act as "red flags" for clothing categories
    const techKeywords = ['bluetooth', 'sans fil', 'ecouteur', 'casque', 'smartwatch', 'montre', 'phone', 'iphone', 'samsung', 'enceinte', 'audio', 'cable', 'chargeur'];
    const maisonKeywords = ['cuisine', 'deco', 'lampe', 'tapis', 'rideau', 'canape', 'fauteuil', 'table'];

    const suspiciousKeywords = [...techKeywords, ...maisonKeywords];

    // Get all clothing-related categories
    const clothingRoot = await prisma.category.findFirst({
        where: { slug: { contains: 'vetement', mode: 'insensitive' } }
    });

    if (!clothingRoot) {
        console.log('No clothing root found');
        return;
    }

    // Find all subcategories recursively (or just getting all categories that might be clothing)
    // Easier approach: Get all products, check their category hierarchy.

    const allProducts = await prisma.product.findMany({
        include: {
            Category: {
                include: {
                    Category: true // Parent
                }
            }
        }
    });

    console.log(`Auditing ${allProducts.length} products...\n`);

    let misclassifiedCount = 0;

    for (const product of allProducts) {
        if (!product.Category) continue;

        const catName = product.Category.name.toLowerCase();
        const parentName = product.Category.Category ? product.Category.Category.name.toLowerCase() : '';
        const fullPath = `${parentName} > ${catName}`;
        const title = product.title.toLowerCase();

        // Check if it's in a clothing-like category but has tech/maison keywords
        const isClothingCategory =
            fullPath.includes('homme') ||
            fullPath.includes('femme') ||
            fullPath.includes('enfant') ||
            fullPath.includes('bebe') ||
            fullPath.includes('vetement') ||
            fullPath.includes('mode');

        // Skip if it's "Montres" category which might be under Mode (fashion watches) vs Tech (smartwatches)
        // But for now let's flag everything.

        if (isClothingCategory) {
            const foundKeyword = suspiciousKeywords.find(k => title.includes(k));
            if (foundKeyword) {
                console.log(`[SUSPICIOUS CLOTHING] Found '${foundKeyword}' in product: "${product.title}"`);
                console.log(`  Current Category: ${product.Category.name} (Parent: ${product.Category.Category?.name})`);
                console.log(`  ID: ${product.id}\n`);
                misclassifiedCount++;
            }
        }

        // Check inverse: Tech category having clothing keywords
        // ... (Optional, focusing on the reported issue first)
    }

    console.log(`Found ${misclassifiedCount} potentially misclassified products.`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
