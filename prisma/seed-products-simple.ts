import { PrismaClient } from '@prisma/client';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

async function main() {
    console.log('🛍️  Creating test products...');

    // Get or create test store
    let store = await prisma.store.findFirst();

    if (!store) {
        const testUser = await prisma.user.upsert({
            where: { email: 'seller@test.com' },
            update: {},
            create: {
                id: randomBytes(16).toString('hex'),
                email: 'seller@test.com',
                password: '$2a$10$K7L/8Y3rIJASJAK3frzCPOxkhFQRe3J4U4Fvnd/cxsVLvRKby.anu',
                name: 'Boutique Test',
                role: 'SELLER'
            }
        });

        store = await prisma.store.create({
            data: {
                id: randomBytes(16).toString('hex'),
                name: 'Achrilik Store',
                description: 'Boutique de v êtements de qualité',
                ownerId: testUser.id,
                address: 'Rue de la Mode, Oran',
                city: 'Oran',
                phone: '0550123456',
                clickCollect: true
            }
        });
    }

    // Get a category
    const category = await prisma.category.findFirst({
        where: { slug: 'tshirts-polos-homme' }
    });

    if (!category) {
        console.log('❌ Category not found');
        return;
    }

    // Create 5 simple products
    for (let i = 1; i <= 5; i++) {
        const product = await prisma.product.create({
            data: {
                title: `T-Shirt Test ${i}`,
                description: `Description du produit test ${i}`,
                price: 1500 + (i * 100),
                images: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
                categoryId: category.id,
                storeId: store.id,
                status: 'APPROVED',
                material: '100% Coton',
                isNew: i <= 2,
                isTrending: i <= 3,
                isBestSeller: i === 1
            }
        });

        // Create 2 variants per product
        await prisma.variant.create({
            data: {
                productId: product.id,
                size: 'M',
                color: 'Noir',
                colorHex: '#000000',
                stock: 50,
                sku: `SKU-${Date.now()}-${i}-M-NOIR`
            }
        });

        await prisma.variant.create({
            data: {
                productId: product.id,
                size: 'L',
                color: 'Blanc',
                colorHex: '#FFFFFF',
                stock: 30,
                sku: `SKU-${Date.now()}-${i}-L-BLANC`
            }
        });

        console.log(`✅ Created: T-Shirt Test ${i}`);
    }

    console.log('\n🎉 Done!');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
