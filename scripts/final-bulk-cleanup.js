
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Helper to remove accents
const normalize = (str) => str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

async function main() {
    console.log('Starting Aggressive Bulk Cleanup...');

    // Target Tech Category IDs
    const CAT_Map = {
        montres: 'cmkmuju71001313mn0d2so9vh',
        audio: 'cmkmujts6000z13mnybu2ee42', // General Audio
        ecouteurs: 'cmkmujtgb000x13mn2b1x7dyq',
        chargeurs: 'cmkmujtgb000v13mno7v5itf7',
        coques: 'cmkmujtgb000w13mn6aom80y3',
        telephonie: 'cmkmujtdb000t13mn0fgf76ky',
        electronique: 'cmkmujtab000r13mn9aaphmlt' // Fallback
    };

    // Keywords Mapping
    const rules = [
        { keys: ['montre', 'smartwatch', 'bracelet connecte', 'watch'], target: CAT_Map.montres, name: 'Montres' },
        { keys: ['ecouteur', 'casque', 'airpod', 'buds', 'enceinte', 'bluetooth', 'sans fil'], target: CAT_Map.ecouteurs, name: 'Écouteurs/Audio' },
        { keys: ['chargeur', 'cable', 'usb', 'batterie', 'power bank', 'magsafe'], target: CAT_Map.chargeurs, name: 'Chargeurs' },
        { keys: ['coque', 'etui', 'protection', 'verre trempe', 'silicone', 'rigide'], target: CAT_Map.coques, name: 'Coques' },
        { keys: ['iphone', 'samsung', 'redmi', 'xiaomi', 'oppo', 'realme'], target: CAT_Map.telephonie, name: 'Téléphonie' },
        { keys: ['manette', 'gamer', 'gaming', 'souris', 'clavier', 'pc', 'laptop'], target: CAT_Map.electronique, name: 'Électronique' }
    ];

    // 1. Get all products in possible clothing categories
    // We identify clothing categories by keywords in their name/slug
    const allCategories = await prisma.category.findMany();
    const clothingCatIds = allCategories
        .filter(c => {
            const n = normalize(c.name);
            return n.includes('homme') || n.includes('femme') || n.includes('enfant') || n.includes('bebe') || n.includes('vetement') || n.includes('mode');
        })
        .map(c => c.id);

    console.log(`Scanning ${clothingCatIds.length} clothing categories...`);

    // 2. Fetch products in those categories
    const products = await prisma.product.findMany({
        where: { categoryId: { in: clothingCatIds } },
        include: { Category: true }
    });

    console.log(`Scanning ${products.length} products for misclassification...`);

    let movedCount = 0;

    for (const product of products) {
        const title = normalize(product.title);
        let matchedRule = null;

        // Find first matching rule
        for (const rule of rules) {
            if (rule.keys.some(k => title.includes(k))) {
                matchedRule = rule;
                break;
            }
        }

        if (matchedRule) {
            console.log(`[MOVING] "${product.title}"`);
            console.log(`  From: ${product.Category.name}`);
            console.log(`  To:   ${matchedRule.name}`);

            await prisma.product.update({
                where: { id: product.id },
                data: { categoryId: matchedRule.target }
            });

            movedCount++;
        }
    }

    console.log(`\nCleanup Complete: Moved ${movedCount} products.`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
