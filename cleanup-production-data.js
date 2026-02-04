import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanup() {
    console.log('🧹 Nettoyage des données de test en production...\n');

    try {
        // 1. Supprimer la boutique de test et ses produits
        console.log('1️⃣ Recherche de la boutique "Boutique Test Audit"...');
        const testStore = await prisma.store.findFirst({
            where: { name: 'Boutique Test Audit' },
            include: { Product: true }
        });

        if (testStore) {
            console.log(`   ✓ Trouvée: ${testStore.Product.length} produits associés`);

            // Supprimer les OrderItems des produits de test (pour éviter contraintes FK)
            for (const product of testStore.Product) {
                const variants = await prisma.variant.findMany({
                    where: { productId: product.id }
                });

                for (const variant of variants) {
                    await prisma.orderItem.deleteMany({
                        where: { variantId: variant.id }
                    });
                }
                console.log(`   ✓ OrderItems supprimés pour: ${product.title}`);
            }

            // Maintenant supprimer les variants
            for (const product of testStore.Product) {
                await prisma.variant.deleteMany({
                    where: { productId: product.id }
                });
                console.log(`   ✓ Variants supprimés pour: ${product.title}`);
            }

            // Supprimer les produits
            await prisma.product.deleteMany({
                where: { storeId: testStore.id }
            });
            console.log(`   ✓ ${testStore.Product.length} produits supprimés`);

            // Supprimer la boutique
            await prisma.store.delete({
                where: { id: testStore.id }
            });
            console.log('   ✅ Boutique Test Audit complètement supprimée\n');
        } else {
            console.log('   ℹ️  Boutique Test Audit non trouvée (déjà nettoyée?)\n');
        }

        // 2. Renommer les produits de test
        console.log('2️⃣ Recherche des produits "T-Shirt Test"...');
        const testProducts = await prisma.product.findMany({
            where: {
                title: {
                    startsWith: 'T-Shirt Test'
                }
            }
        });

        console.log(`   ✓ Trouvés: ${testProducts.length} produits`);

        if (testProducts.length > 0) {
            const names = [
                'T-Shirt Homme Classique Noir',
                'T-Shirt Col Rond Gris',
                'T-Shirt Basique Bleu Marine',
                'T-Shirt Sport Anthracite',
                'T-Shirt Décontracté Blanc'
            ];

            for (let i = 0; i < testProducts.length; i++) {
                const product = testProducts[i];
                const newName = names[i] || `T-Shirt Homme ${i + 1}`;

                await prisma.product.update({
                    where: { id: product.id },
                    data: {
                        title: newName,
                        description: 'T-shirt en coton confortable pour homme. Coupe classique, parfait pour le quotidien.'
                    }
                });
                console.log(`   ✓ "${product.title}" → "${newName}"`);
            }
            console.log(`   ✅ ${testProducts.length} produits de test renommés\n`);
        } else {
            console.log('   ℹ️  Aucun produit "T-Shirt Test" trouvé\n');
        }

        console.log('✅ Nettoyage terminé avec succès!');

    } catch (error) {
        console.error('❌ Erreur lors du nettoyage:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

cleanup();
