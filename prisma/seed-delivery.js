const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedDeliverySystem() {
    console.log('🌱 Seeding delivery system...');

    try {
        // 1. Create a delivery agent user
        const hashedPassword = await bcrypt.hash('delivery123', 10);

        const deliveryUser = await prisma.user.upsert({
            where: { email: 'livreur@achrilik.com' },
            update: {},
            create: {
                email: 'livreur@achrilik.com',
                password: hashedPassword,
                name: 'Ahmed Benali',
                role: 'DELIVERY_AGENT',
                roles: ['BUYER', 'DELIVERY_AGENT'],
                phone: '+213 555 12 34 56'
            }
        });

        console.log('✅ Created delivery user:', deliveryUser.email);

        // 2. Create DeliveryAgent profile
        const deliveryAgent = await prisma.deliveryAgent.upsert({
            where: { userId: deliveryUser.id },
            update: {},
            create: {
                id: `agent_${deliveryUser.id}`,
                userId: deliveryUser.id,
                provider: 'INDEPENDENT',
                vehicleType: 'Moto',
                wilayasCovered: ['Oran', 'Mostaganem', 'Sidi Bel Abbès'],
                isActive: true,
                isVerified: true,
                totalDeliveries: 42,
                successRate: 95.5
            }
        });

        console.log('✅ Created delivery agent profile');

        // 3. Create some test orders with deliveries
        const seller = await prisma.user.findFirst({
            where: { role: 'SELLER' }
        });

        if (seller) {
            // Order 1 - Accepted
            const order1 = await prisma.order.create({
                data: {
                    id: `order_delivery_1_${Date.now()}`,
                    userId: deliveryUser.id,
                    sellerId: seller.id,
                    total: 1500,
                    status: 'ACCEPTED',
                    isPaid: false,
                    shippingName: 'Yacine Benali',
                    shippingPhone: '+213 555 12 34 56',
                    shippingAddress: '12 Rue Djaboune Mourad',
                    shippingWilaya: 'Oran',
                    shippingCommune: 'Oran Centre',
                    shippingMethod: 'COD'
                }
            });

            await prisma.delivery.create({
                data: {
                    id: `delivery_1_${Date.now()}`,
                    orderId: order1.id,
                    agentId: deliveryAgent.id,
                    status: 'ACCEPTED',
                    trackingNumber: 'TRK-123456789',
                    trackingUrl: 'https://track.example.com/TRK-123456789',
                    codAmount: 1500,
                    codCollected: false,
                    assignedAt: new Date()
                }
            });

            // Order 2 - In Transit
            const order2 = await prisma.order.create({
                data: {
                    id: `order_delivery_2_${Date.now()}`,
                    userId: deliveryUser.id,
                    sellerId: seller.id,
                    total: 2800,
                    status: 'READY_TO_SHIP',
                    isPaid: false,
                    shippingName: 'Amina Kadri',
                    shippingPhone: '+213 661 78 90 12',
                    shippingAddress: 'Cité 2000 Logements, Bâtiment A',
                    shippingWilaya: 'Oran',
                    shippingCommune: 'Es Senia',
                    shippingMethod: 'COD'
                }
            });

            await prisma.delivery.create({
                data: {
                    id: `delivery_2_${Date.now()}`,
                    orderId: order2.id,
                    agentId: deliveryAgent.id,
                    status: 'IN_TRANSIT',
                    trackingNumber: 'TRK-987654321',
                    trackingUrl: 'https://track.example.com/TRK-987654321',
                    codAmount: 2800,
                    codCollected: false,
                    assignedAt: new Date(Date.now() - 86400000) // 1 day ago
                }
            });

            // Order 3 - Delivered
            const order3 = await prisma.order.create({
                data: {
                    id: `order_delivery_3_${Date.now()}`,
                    userId: deliveryUser.id,
                    sellerId: seller.id,
                    total: 3100,
                    status: 'DELIVERED',
                    isPaid: true,
                    shippingName: 'Karim Saidi',
                    shippingPhone: '+213 772 45 67 89',
                    shippingAddress: 'Villa 45, Lotissement El Bahia',
                    shippingWilaya: 'Oran',
                    shippingCommune: 'Bir El Djir',
                    shippingMethod: 'COD'
                }
            });

            await prisma.delivery.create({
                data: {
                    id: `delivery_3_${Date.now()}`,
                    orderId: order3.id,
                    agentId: deliveryAgent.id,
                    status: 'DELIVERED',
                    trackingNumber: 'TRK-456123789',
                    trackingUrl: 'https://track.example.com/TRK-456123789',
                    codAmount: 3100,
                    codCollected: true,
                    codCollectedAt: new Date(Date.now() - 172800000), // 2 days ago
                    assignedAt: new Date(Date.now() - 259200000) // 3 days ago
                }
            });

            console.log('✅ Created 3 test deliveries');
        }

        console.log('\n🎉 Delivery system seeded successfully!');
        console.log('\n📧 Login credentials:');
        console.log('   Email: livreur@achrilik.com');
        console.log('   Password: delivery123');
        console.log('\n🚚 Access dashboard at: /delivery/dashboard');

    } catch (error) {
        console.error('❌ Error seeding delivery system:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

seedDeliverySystem();
