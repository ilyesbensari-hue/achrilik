const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting seed...');

    // Create test seller
    const seller = await prisma.user.upsert({
        where: { email: 'testseller@example.com' },
        update: {},
        create: {
            email: 'testseller@example.com',
            password: 'password123',
            name: 'Test Seller',
            role: 'SELLER',
        },
    });

    console.log('✅ Created seller:', seller.email);

    // Create store for seller
    const store = await prisma.store.upsert({
        where: { ownerId: seller.id },
        update: {},
        create: {
            ownerId: seller.id,
            name: 'Boutique Test',
            description: 'Une boutique de test pour analytics',
            address: '123 Rue Test, Oran',
            city: 'Oran',
            phone: '+213 555 123 456',
            latitude: 35.6969,
            longitude: -0.6331,
        },
    });

    console.log('✅ Created store:', store.name);

    // Create test products
    const products = [];
    for (let i = 1; i <= 5; i++) {
        const product = await prisma.product.create({
            data: {
                title: `Produit Test ${i}`,
                description: `Description du produit test ${i}`,
                price: 1000 * i,
                images: 'https://via.placeholder.com/400',
                storeId: store.id,
                variants: {
                    create: {
                        size: 'M',
                        color: 'Noir',
                        stock: 50,
                    },
                },
            },
            include: {
                variants: true,
            },
        });
        products.push(product);
        console.log(`✅ Created product: ${product.title}`);
    }

    // Create test buyer
    const buyer = await prisma.user.upsert({
        where: { email: 'testbuyer@example.com' },
        update: {},
        create: {
            email: 'testbuyer@example.com',
            password: 'password123',
            name: 'Test Buyer',
            role: 'BUYER',
        },
    });

    console.log('✅ Created buyer:', buyer.email);

    // Create test orders with different statuses
    const statuses = ['PENDING', 'CONFIRMED', 'READY', 'DELIVERED', 'CANCELLED'];
    const now = new Date();

    for (let i = 0; i < 10; i++) {
        const product = products[i % products.length];
        const variant = product.variants[0];
        const status = statuses[i % statuses.length];

        // Create orders from different dates (last 30 days)
        const daysAgo = Math.floor(Math.random() * 30);
        const orderDate = new Date(now);
        orderDate.setDate(orderDate.getDate() - daysAgo);

        const order = await prisma.order.create({
            data: {
                userId: buyer.id,
                status: status,
                total: product.price * (i % 3 + 1),
                paymentMethod: 'CASH_ON_DELIVERY',
                deliveryType: 'DELIVERY',
                createdAt: orderDate,
                items: {
                    create: {
                        variantId: variant.id,
                        quantity: i % 3 + 1,
                        price: product.price,
                    },
                },
            },
        });

        console.log(`✅ Created order #${i + 1} (${status}) from ${daysAgo} days ago`);
    }

    // Create some reviews
    for (let i = 0; i < 3; i++) {
        const product = products[i];
        await prisma.review.create({
            data: {
                userId: buyer.id,
                productId: product.id,
                rating: 4 + (i % 2),
                comment: `Excellent produit! Très satisfait de mon achat ${i + 1}.`,
            },
        });
        console.log(`✅ Created review for ${product.title}`);
    }

    console.log('🎉 Seed completed successfully!');
    console.log('\n📝 Test credentials:');
    console.log('Seller: testseller@example.com / password123');
    console.log('Buyer: testbuyer@example.com / password123');
}

main()
    .catch((e) => {
        console.error('❌ Error during seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
