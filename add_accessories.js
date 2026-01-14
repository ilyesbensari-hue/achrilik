
// Script to add Phone Accessories to the database
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('📱 Adding Phone Accessories...');

        // 1. Find "Accessoires" category
        const accessoires = await prisma.category.findFirst({
            where: { slug: 'accessoires' }
        });

        if (!accessoires) {
            console.error('Category "Accessoires" not found!');
            return;
        }

        // 2. Create "Accessoires Téléphone" subcategory
        const phoneAcc = await prisma.category.upsert({
            where: { slug: 'accessoires-telephone' },
            update: {},
            create: {
                name: 'Accessoires Téléphone',
                slug: 'accessoires-telephone',
                parentId: accessoires.id
            }
        });
        console.log('Created Category:', phoneAcc.name);

        // 3. Get the store (Fashion Oran) to assign products to
        const store = await prisma.store.findFirst({
            where: { name: 'Fashion Oran' }
        });

        if (!store) {
            console.error('Store not found!');
            return;
        }

        // 4. Create Sample Products
        const products = [
            {
                title: 'Coque iPhone 13 Pro Transparente',
                description: 'Coque de protection ultra-fine et résistante aux chocs.',
                price: 1500,
                categoryId: phoneAcc.id,
                images: 'https://images.unsplash.com/photo-1603539270921-65476a6d36e2?w=800', // Generic phone case
                variants: [
                    { size: 'iPhone 13', color: 'Transparent', stock: 50 },
                    { size: 'iPhone 13 Pro', color: 'Transparent', stock: 30 }
                ]
            },
            {
                title: 'Batterie Externe 10000mAh',
                description: 'Power bank compacte, charge rapide pour tous smartphones.',
                price: 3500,
                categoryId: phoneAcc.id,
                images: 'https://images.unsplash.com/photo-1609592425026-6b2706346766?w=800', // Power bank
                variants: [
                    { size: 'Standard', color: 'Noir', stock: 20 },
                    { size: 'Standard', color: 'Blanc', stock: 15 }
                ]
            },
            {
                title: 'Câble Chargeur USB-C Rapide',
                description: 'Câble tressé résistant, 1 mètre.',
                price: 800,
                categoryId: phoneAcc.id,
                images: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800', // Cable
                variants: [
                    { size: '1m', color: 'Noir', stock: 100 },
                    { size: '2m', color: 'Rouge', stock: 50 }
                ]
            }
        ];

        for (const p of products) {
            const { variants, ...data } = p;
            await prisma.product.create({
                data: {
                    ...data,
                    storeId: store.id,
                    variants: {
                        create: variants
                    }
                }
            });
            console.log('Created Product:', p.title);
        }

        console.log('✅ Phone Accessories added successfully!');

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
