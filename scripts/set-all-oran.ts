import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function setAllStoresOran() {
    try {
        console.log('🔄 Mise à jour de toutes les boutiques vers Oran...');

        // Update all stores to Oran
        const result = await prisma.store.updateMany({
            where: {},
            data: {
                city: 'Oran',
                // Set Oran coordinates if not set
                latitude: 35.6969,
                longitude: -0.6331
            }
        });

        console.log(`✅ ${result.count} boutique(s) mise(s) à jour vers Oran`);

        // Show all stores after update
        const stores = await prisma.store.findMany({
            select: {
                id: true,
                name: true,
                city: true,
                _count: {
                    select: { Product: true }
                }
            }
        });

        console.log('\n📊 Boutiques après mise à jour:');
        stores.forEach(store => {
            console.log(`  - ${store.name}: ${store.city} (${store._count.Product} produits)`);
        });

    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await prisma.$disconnect();
    }
}

setAllStoresOran();
