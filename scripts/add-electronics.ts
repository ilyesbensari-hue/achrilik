
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔌 Adding Electronics & High-Tech products...');

    // 1. Get or Create Seller (using default demo seller)
    const seller = await prisma.user.findFirst({
        where: { email: 'demo@achrilik.com' }
    });

    if (!seller) {
        console.error('❌ Demo seller not found. Please run main seed first.');
        return;
    }

    const store = await prisma.store.findFirst({
        where: { ownerId: seller.id }
    });

    if (!store) {
        console.error('❌ Demo store not found.');
        return;
    }

    // 2. Create High-Tech Category
    const highTech = await prisma.category.upsert({
        where: { slug: 'high-tech' },
        update: {},
        create: { name: 'High-Tech', slug: 'high-tech' },
    });

    // 3. Create Subcategories
    const phoneAccessories = await prisma.category.upsert({
        where: { slug: 'accessoires-telephones' },
        update: {},
        create: { name: 'Accessoires Téléphones', slug: 'accessoires-telephones', parentId: highTech.id },
    });

    const smartWatches = await prisma.category.upsert({
        where: { slug: 'montres-connectees' },
        update: {},
        create: { name: 'Montres Connectées', slug: 'montres-connectees', parentId: highTech.id },
    });

    const audio = await prisma.category.upsert({
        where: { slug: 'audio' },
        update: {},
        create: { name: 'Audio & Son', slug: 'audio', parentId: highTech.id },
    });

    // 4. Create Products
    const products = [
        // Coques & Câbles
        {
            title: 'Coque iPhone 14/15 Transparente',
            description: 'Coque de protection ultra-fine, anti-jaunissement et résistante aux chocs.',
            price: 1500,
            categoryId: phoneAccessories.id,
            images: 'https://images.unsplash.com/photo-1603313011171-3195d43c249a?w=800',
            variants: [
                { size: 'iPhone 14', color: 'Transparent', stock: 20 },
                { size: 'iPhone 15', color: 'Transparent', stock: 20 },
                { size: 'iPhone 13', color: 'Transparent', stock: 15 },
            ],
        },
        {
            title: 'Câble Charge Rapide USB-C',
            description: 'Câble tressé ultra-résistant 20W pour charge rapide Samsung et iPhone 15.',
            price: 1200,
            categoryId: phoneAccessories.id,
            images: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800',
            variants: [
                { size: '1m', color: 'Blanc', stock: 50 },
                { size: '2m', color: 'Noir', stock: 30 },
            ],
        },
        {
            title: 'Batterie Externe 10000mAh',
            description: 'Powerbank compacte avec 2 ports USB et indicateur LED.',
            price: 3500,
            categoryId: phoneAccessories.id,
            images: 'https://images.unsplash.com/photo-1609592424362-e67c8702b89d?w=800',
            variants: [
                { size: 'Standard', color: 'Noir', stock: 15 },
                { size: 'Standard', color: 'Blanc', stock: 10 },
            ],
        },

        // Montres
        {
            title: 'Smartwatch Series 8 Ultra',
            description: 'Montre connectée avec écran AMOLED, suivi santé et appels Bluetooth.',
            price: 8500,
            categoryId: smartWatches.id,
            images: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800',
            variants: [
                { size: '45mm', color: 'Noir/Noir', stock: 10 },
                { size: '45mm', color: 'Argent/Gris', stock: 8 },
                { size: '49mm', color: 'Orange', stock: 5 },
            ],
        },
        {
            title: 'Bracelet Connecté Sport',
            description: 'Idéal pour le sport : podomètre, cardio, et sommeil.',
            price: 4500,
            categoryId: smartWatches.id,
            images: 'https://images.unsplash.com/photo-1558230232-a54972a93322?w=800',
            variants: [
                { size: 'Unique', color: 'Noir', stock: 20 },
            ],
        },

        // Audio
        {
            title: 'Écouteurs Sans Fil Pro',
            description: 'Écouteurs Bluetooth avec réduction de bruit active et boîtier de charge.',
            price: 4500,
            categoryId: audio.id,
            images: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800',
            variants: [
                { size: 'Unique', color: 'Blanc', stock: 25 },
                { size: 'Unique', color: 'Noir', stock: 15 },
            ],
        },
        {
            title: 'Enceinte Bluetooth Portable',
            description: 'Petite enceinte puissante et étanche pour vos sorties.',
            price: 5500,
            categoryId: audio.id,
            images: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800',
            variants: [
                { size: 'Standard', color: 'Bleu', stock: 10 },
                { size: 'Standard', color: 'Rouge', stock: 8 },
                { size: 'Standard', color: 'Noir', stock: 12 },
            ],
        }
    ];

    for (const productData of products) {
        const { variants, ...data } = productData;

        // Use create because titles might duplicate but we want more items
        // OR better check existence to avoid dups if run twice
        const existing = await prisma.product.findFirst({
            where: { title: data.title, storeId: store.id }
        });

        if (!existing) {
            await prisma.product.create({
                data: {
                    ...data,
                    storeId: store.id,
                    variants: {
                        create: variants,
                    },
                },
            });
            console.log(`✅ Created: ${data.title}`);
        } else {
            console.log(`⏩ Skipped (already exists): ${data.title}`);
        }
    }

    console.log('✨ High-Tech products added successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
