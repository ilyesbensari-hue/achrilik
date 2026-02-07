// Post-launch: Add products to empty categories
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Adding products to empty categories...\n');

    // Category IDs
    const categories = {
        enfant: 'cat-enfant',
        maroquinerie: '457821bfaeb8bde0ffb13fb010b41b88',
        accessoires: '0f24e9b613932b9a4ebd0cf4c0cf7bb2',
        electronique: '5a928bff5f4f35a52aa3d9c52c98bd9c'
    };

    const storeId = 'dc5a6ade0b4e3bfd77ff826fafe0f932'; // Fashion Oran

    // Products to add
    const products = [
        // Enfant
        {
            id: 'prod-enfant-1',
            title: 'Ensemble Bébé Confort Rose',
            slug: 'ensemble-bebe-confort-rose',
            description: 'Ensemble complet pour bébé en coton doux, couleur rose.',
            price: 3500,
            images: ['https://images.unsplash.com/photo-1519706342267-cc9616d22692?w=800'],
            categoryId: categories.enfant,
            storeId,
            status: 'APPROVED',
            isFeatured: false,
            isNew: true,
            stock: 15
        },
        {
            id: 'prod-enfant-2',
            title: 'Pyjama Enfant Confort',
            slug: 'pyjama-enfant-confort',
            description: 'Pyjama doux pour enfants, parfait pour les nuits confortables.',
            price: 2800,
            images: ['https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=800'],
            categoryId: categories.enfant,
            storeId,
            status: 'APPROVED',
            isFeatured: false,
            isNew: true,
            stock: 20
        },
        // Maroquinerie
        {
            id: 'prod-maro-1',
            title: 'Sac à Main Cuir Élégant',
            slug: 'sac-a-main-cuir-elegant',
            description: 'Sac à main en cuir véritable, design élégant et intemporel.',
            price: 8500,
            images: ['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800'],
            categoryId: categories.maroquinerie,
            storeId,
            status: 'APPROVED',
            isFeatured: false,
            isNew: false,
            stock: 10
        },
        {
            id: 'prod-maro-2',
            title: 'Portefeuille Cuir Premium',
            slug: 'portefeuille-cuir-premium',
            description: 'Portefeuille en cuir de haute qualité avec multiples compartiments.',
            price: 4200,
            images: ['https://images.unsplash.com/photo-1627123424574-724758594e93?w=800'],
            categoryId: categories.maroquinerie,
            storeId,
            status: 'APPROVED',
            isFeatured: false,
            isNew: true,
            stock: 25
        },
        // Accessoires
        {
            id: 'prod-acc-1',
            title: 'Montre Classique Homme',
            slug: 'montre-classique-homme',
            description: 'Montre élégante pour homme, bracelet en cuir véritable.',
            price: 6500,
            images: ['https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800'],
            categoryId: categories.accessoires,
            storeId,
            status: 'APPROVED',
            isFeatured: false,
            isNew: false,
            stock: 12
        },
        {
            id: 'prod-acc-2',
            title: 'Lunettes de Soleil Tendance',
            slug: 'lunettes-de-soleil-tendance',
            description: 'Lunettes de soleil modernes, protection UV400.',
            price: 3200,
            images: ['https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800'],
            categoryId: categories.accessoires,
            storeId,
            status: 'APPROVED',
            isFeatured: false,
            isNew: true,
            stock: 18
        },
        // Électronique
        {
            id: 'prod-elec-1',
            title: 'Écouteurs Bluetooth Pro',
            slug: 'ecouteurs-bluetooth-pro',
            description: 'Écouteurs sans fil Bluetooth 5.0, autonomie 24h.',
            price: 5800,
            images: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800'],
            categoryId: categories.electronique,
            storeId,
            status: 'APPROVED',
            isFeatured: false,
            isNew: true,
            stock: 30
        },
        {
            id: 'prod-elec-2',
            title: 'Powerbank 20000mAh',
            slug: 'powerbank-20000mah',
            description: 'Batterie externe haute capacité, charge rapide.',
            price: 4500,
            images: ['https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800'],
            categoryId: categories.electronique,
            storeId,
            status: 'APPROVED',
            isFeatured: false,
            isNew: true,
            stock: 40
        }
    ];

    // Insert products
    for (const product of products) {
        try {
            await prisma.product.upsert({
                where: { id: product.id },
                update: product,
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
