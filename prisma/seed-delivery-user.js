const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🚚 Création du compte prestataire de livraison...');

    // 1. Créer utilisateur avec rôle DELIVERY_AGENT
    const hashedPassword = await bcrypt.hash('livreur123', 10);

    const deliveryUser = await prisma.user.upsert({
        where: { email: 'livreur@achrilik.com' },
        update: {
            roles: ['DELIVERY_AGENT', 'BUYER'], // Multi-rôle
        },
        create: {
            email: 'livreur@achrilik.com',
            name: 'Karim Livreur',
            password: hashedPassword,
            phone: '0770123456',
            role: 'BUYER', // Backward compatibility
            roles: ['DELIVERY_AGENT', 'BUYER'],
        },
    });

    console.log('✅ Utilisateur créé:', deliveryUser.email);

    // 2. Créer profil DeliveryAgent
    const deliveryAgent = await prisma.deliveryAgent.upsert({
        where: { userId: deliveryUser.id },
        update: {},
        create: {
            userId: deliveryUser.id,
            vehicleType: 'MOTO',
            licenseNumber: 'DZ-2024-12345',
            isAvailable: true,
            wilaya: 'Oran',
        },
    });

    console.log('✅ Profil livreur créé:', deliveryAgent.id);

    // 3. Créer quelques livraisons de test
    const sellers = await prisma.user.findMany({
        where: { roles: { has: 'SELLER' } },
        take: 2,
    });

    if (sellers.length > 0) {
        const orders = await prisma.order.findMany({
            where: {
                sellerId: { in: sellers.map(s => s.id) },
                status: { in: ['CONFIRMED', 'SHIPPED'] }
            },
            take: 5,
        });

        for (const order of orders) {
            const delivery = await prisma.delivery.create({
                data: {
                    orderId: order.id,
                    agentId: deliveryAgent.id,
                    status: ['ASSIGNED', 'ACCEPTED', 'IN_TRANSIT'][Math.floor(Math.random() * 3)],
                    trackingNumber: `ACH-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
                    pickupAddress: 'Boutique Fashion DZ, Oran',
                    deliveryAddress: order.shippingAddress || 'Adresse client',
                    estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // +2 jours
                    codAmount: order.paymentMethod === 'COD' ? order.total : 0,
                    codCollected: false,
                },
            });

            console.log(`✅ Livraison créée: ${delivery.trackingNumber}`);
        }
    }

    console.log('\n🎉 Seed terminé !');
    console.log('\n📋 Compte prestataire:');
    console.log('   Email: livreur@achrilik.com');
    console.log('   Password: livreur123');
    console.log('   Dashboard: http://localhost:3000/delivery/dashboard');
}

main()
    .catch((e) => {
        console.error('❌ Erreur:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
