import { prisma } from '../src/lib/prisma';

async function main() {
    console.log('🛒 Starting multi-store shopping simulation...\n');

    // 1. Create multiple sellers and stores
    console.log('👥 Creating sellers and stores...');

    const sellers = [];
    const stores = [];

    const storeData = [
        { name: 'Fashion Alger', city: 'Alger', lat: 36.7538, lng: 3.0588, address: 'Bab Ezzouar, Alger' },
        { name: 'Style Oran', city: 'Oran', lat: 35.6969, lng: -0.6331, address: 'Centre-ville, Oran' },
        { name: 'Mode Constantine', city: 'Constantine', lat: 36.3650, lng: 6.6147, address: 'Zouaghi, Constantine' },
        { name: 'Tendance Annaba', city: 'Annaba', lat: 36.9000, lng: 7.7667, address: 'Centre Commercial, Annaba' },
        { name: 'Chic Sétif', city: 'Sétif', lat: 36.1909, lng: 5.4149, address: 'Avenue 8 Mai, Sétif' },
    ];

    for (let i = 0; i < storeData.length; i++) {
        const seller = await prisma.user.create({
            data: {
                email: `seller${i + 1}@achrilik.com`,
                password: 'seller123',
                name: `Vendeur ${i + 1}`,
                role: 'SELLER',
            },
        });
        sellers.push(seller);

        const store = await prisma.store.create({
            data: {
                name: storeData[i].name,
                description: `Votre boutique de mode à ${storeData[i].city}`,
                ownerId: seller.id,
                city: storeData[i].city,
                latitude: storeData[i].lat,
                longitude: storeData[i].lng,
                address: storeData[i].address,
            },
        });
        stores.push(store);
        console.log(`✅ Created: ${store.name} in ${store.city}`);
    }

    // 2. Get categories
    console.log('\n📁 Fetching categories...');
    const categories = await prisma.category.findMany({
        where: { parentId: { not: null } } // Only subcategories
    });
    console.log(`Found ${categories.length} categories`);

    // 3. Create products for each store
    console.log('\n📦 Creating products...');

    const productTemplates = [
        { title: 'Robe Élégante', price: 8500, desc: 'Robe pour occasions spéciales' },
        { title: 'Chemise Classique', price: 4200, desc: 'Chemise en coton premium' },
        { title: 'Jean Moderne', price: 6800, desc: 'Jean confortable et tendance' },
        { title: 'Pull Doux', price: 7200, desc: 'Pull en laine pour l\'hiver' },
        { title: 'T-shirt Premium', price: 2500, desc: 'T-shirt en cotton de qualité' },
        { title: 'Sac à Main', price: 9500, desc: 'Sac élégant et spacieux' },
        { title: 'Montre Sport', price: 12000, desc: 'Montre digitale moderne' },
        { title: 'Chaussures Sneakers', price: 8900, desc: 'Baskets confortables' },
    ];

    const sizes = ['S', 'M', 'L', 'XL'];
    const colors = ['#000000', '#FFFFFF', '#FF0000', '#0000FF', '#FFD700'];

    for (const store of stores) {
        // Each store gets 4 random products
        for (let i = 0; i < 4; i++) {
            const template = productTemplates[Math.floor(Math.random() * productTemplates.length)];
            const category = categories[Math.floor(Math.random() * categories.length)];

            await prisma.product.create({
                data: {
                    title: `${template.title} - ${store.city}`,
                    description: template.desc,
                    price: template.price + Math.floor(Math.random() * 2000),
                    images: `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000000000)}?w=800`,
                    storeId: store.id,
                    categoryId: category.id,
                    status: 'APPROVED',
                    variants: {
                        create: [
                            { size: sizes[0], color: colors[Math.floor(Math.random() * colors.length)], stock: Math.floor(Math.random() * 15) + 5 },
                            { size: sizes[1], color: colors[Math.floor(Math.random() * colors.length)], stock: Math.floor(Math.random() * 15) + 5 },
                            { size: sizes[2], color: colors[Math.floor(Math.random() * colors.length)], stock: Math.floor(Math.random() * 15) + 5 },
                        ]
                    }
                },
            });
        }
        console.log(`✅ Created 4 products for ${store.name}`);
    }

    // 4. Create test buyers
    console.log('\n👤 Creating test buyers...');
    const buyers = [];
    for (let i = 0; i < 3; i++) {
        const buyer = await prisma.user.create({
            data: {
                email: `buyer${i + 1}@achrilik.com`,
                password: 'buyer123',
                name: `Acheteur ${i + 1}`,
                role: 'BUYER',
            },
        });
        buyers.push(buyer);
        console.log(`✅ Created: ${buyer.name} (${buyer.email})`);
    }

    // 5. Simulate shopping - Create orders with mixed products
    console.log('\n🛍️ Simulating shopping cart...');

    const allProducts = await prisma.product.findMany({
        include: { variants: true, store: true }
    });

    console.log(`Found ${allProducts.length} products from ${stores.length} stores\n`);

    // Log simulation summary
    console.log('='.repeat(50));
    console.log('📊 SIMULATION SUMMARY');
    console.log('='.repeat(50));
    console.log(`👥 Sellers created: ${sellers.length}`);
    console.log(`🏪 Stores created: ${stores.length}`);
    console.log(`📦 Products created: ${allProducts.length}`);
    console.log(`🛒 Buyers created: ${buyers.length}`);
    console.log('\n💡 NEXT STEPS:');
    console.log('1. Login as: buyer1@achrilik.com / buyer123');
    console.log('2. Browse products from different stores');
    console.log('3. Add multiple products to cart');
    console.log('4. Check cart to see mixed vendor items');
    console.log('5. View Click & Collect vs Delivery options');
    console.log('\n🔑 TEST ACCOUNTS:');
    buyers.forEach((b, i) => console.log(`   Buyer ${i + 1}: ${b.email} / buyer123`));
    console.log('\n✅ Simulation completed successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
