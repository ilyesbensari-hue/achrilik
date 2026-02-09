// Script pour configurer une boutique avec livraison gratuite
// Usage: node configure-free-delivery.js

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('🔍 Searching for stores in Oran...');

        const oranStore = await prisma.store.findFirst({
            where: {
                city: 'Oran'
            }
        });

        if (!oranStore) {
            console.error('❌ No store found in Oran');
            return;
        }

        console.log(`✅ Found store: ${oranStore.name} (ID: ${oranStore.id})`);
        console.log(`📍 Location: ${oranStore.city}`);

        console.log('\n🔧 Configuring free delivery...');

        const updated = await prisma.store.update({
            where: { id: oranStore.id },
            data: {
                offersFreeDelivery: true,
                freeDeliveryThreshold: 8000
            }
        });

        console.log('✅ Store configured successfully!');
        console.log(`   - offersFreeDelivery: ${updated.offersFreeDelivery}`);
        console.log(`   - freeDeliveryThreshold: ${updated.freeDeliveryThreshold} DA`);

        console.log('\n💡 Test scenario:');
        console.log(`   - Add product from "${updated.name}" for 6000 DA`);
        console.log(`   - Popup should suggest adding 2000 DA more`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
