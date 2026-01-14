import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateToOran() {
    console.log('🔄 Mise à jour de toutes les boutiques vers Oran...');

    const result = await prisma.store.updateMany({
        data: {
            city: 'Oran',
            latitude: 35.6969,
            longitude: -0.6331,
            address: 'Centre-ville Oran',
        },
    });

    console.log(`✅ ${result.count} boutique(s) mise(s) à jour vers Oran !`);
}

updateToOran()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
