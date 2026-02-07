// Post-launch: Add products to empty categories
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Adding products to empty categories...\n');

    const storeId = 'dc5a6ade0b4e3bfd77ff826fafe0f932'; // Fashion Oran

    // Products to add (matching actual Product schema)
    const products = [
        // Enfant (cat-enfant)
        {
            id: 'prod-enfant-1',
            title: 'Ensemble Bébé Confort Rose',
            description: 'Ensemble complet pour bébé en coton doux, couleur rose.',
            price: 3500,
            images: JSON.stringify(['https://images.unsplash.com/photo-1519706342267-cc9616d22692?w=800']),
            categoryId: 'cat-enfant',
            storeId,
            status: 'APPROVED',
            isNew: true
        },
        {
            id: 'prod-enfant-2',
            title: 'Pyjama Enfant Confort',
            description: 'Pyjama doux pour enfants, parfait pour les nuits confortables.',
            price: 2800,
            images: JSON.stringify(['https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=800']),
            categoryId: 'cat-enfant',
            storeId,
            status: 'APPROVED',
            isNew: true
        },
        // Maroquinerie
        {
            id: 'prod-maro-1',
            title: 'Sac à Main Cuir Élégant',
            description: 'Sac à main en cuir véritable, design élégant et intemporel.',
            price: 8500,
            images: JSON.stringify(['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800']),
            categoryId: '457821bfaeb8bde0ffb13fb010b41b88',
            storeId,
            status: 'APPROVED',
            isNew: false
        },
        {
            id: 'prod-maro-2',
            title: 'Portefeuille Cuir Premium',
            description: 'Portefeuille en cuir de haute qualité avec multiples compartiments.',
            price: 4200,
            images: JSON.stringify(['https://images.unsplash.com/photo-1627123424574-724758594e93?w=800']),
            categoryId: '457821bfaeb8bde0ffb13fb010b41b88',
            storeId,
            status: 'APPROVED',
            isNew: true
        },
        // Accessoires
        {
            id: 'prod-acc-1',
            title: 'Montre Classique Homme',
            description: 'Montre élégante pour homme, bracelet en cuir véritable.',
            price: 6500,
            images: JSON.stringify(['https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800']),
            categoryId: '0f24e9b613932b9a4ebd0cf4c0cf7bb2',
            storeId,
            status: 'APPROVED',
            isNew: false
        },
        {
            id: 'prod-acc-2',
            title: 'Lunettes de Soleil Tendance',
            description: 'Lunettes de soleil modernes, protection UV400.',
            price: 3200,
            images: JSON.stringify(['https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800']),
            categoryId: '0f24e9b613932b9a4ebd0cf4c0cf7bb2',
            storeId,
            status: 'APPROVED',
            isNew: true
        },
        // Électronique
        {
            id: 'prod-elec-1',
            title: 'Écouteurs Bluetooth Pro',
            description: 'Écouteurs sans fil Bluetooth 5.0, autonomie 24h.',
            price: 5800,
            images: JSON.stringify(['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800']),
            categoryId: '5a928bff5f4f35a52aa3d9c52c98bd9c',
            storeId,
            status: 'APPROVED',
            isNew: true
        },
        {
            id: 'prod-elec-2',
            title: 'Powerbank 20000mAh',
            description: 'Batterie externe haute capacité, charge rapide.',
            price: 4500,
            images: JSON.stringify(['https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800']),
            categoryId: '5a928bff5f4f35a52aa3d9c52c98bd9c',
            storeId,
            status: 'APPROVED',
            isNew: true
        }
    ];

    // Insert products
    for (const product of products) {
        try {
            await prisma.product.upsert({
                where: { id: product.id },
                update: {
                    title: product.title,
                    description: product.description,
                    price: product.price,
                    images: product.images,
                    categoryId: product.categoryId,
                    storeId: product.storeId,
                    status: product.status,
                    isNew: product.isNew
                },
                create: product
            });
            console.log(`✓ Added: ${product.title}`);
        } catch (error) {
            console.error(`✗ Failed to add ${product.title}:`, error.message);
        }
    }

    // Verify
    console.log('\n📊 Category Product Count:');
    const counts = await prisma.$queryRaw`
    SELECT 
      c.name as category_name,
      COUNT(p.id) as product_count
    FROM "Category" c
    LEFT JOIN "Product" p ON p."categoryId" = c.id AND p.status = 'APPROVED'
    WHERE c.slug IN ('enfants', 'maroquinerie', 'accessoires', 'electronique')
    GROUP BY c.name
    ORDER BY c.name
  `;

    console.table(counts);
    console.log('\n✅ Products added successfully!');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
