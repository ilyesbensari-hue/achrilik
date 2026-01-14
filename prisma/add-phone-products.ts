import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('📱 Ajout de produits d\'accessoires pour téléphone...');

    // Trouver le store demo
    const store = await prisma.store.findFirst({
        where: { city: 'Oran' }
    });

    if (!store) {
        console.error('❌ Store introuvable');
        return;
    }

    // Trouver les catégories
    const coques = await prisma.category.findUnique({ where: { slug: 'coques-telephone' } });
    const cables = await prisma.category.findUnique({ where: { slug: 'cables-chargeurs' } });
    const ecouteurs = await prisma.category.findUnique({ where: { slug: 'ecouteurs-audio' } });
    const protections = await prisma.category.findUnique({ where: { slug: 'protections-ecran' } });
    const powerbanks = await prisma.category.findUnique({ where: { slug: 'powerbanks' } });

    if (!coques || !cables || !ecouteurs || !protections || !powerbanks) {
        console.error('❌ Certaines catégories sont introuvables');
        return;
    }

    const products = [
        // Coques de téléphone
        {
            title: 'Coque iPhone 14 Silicone',
            description: 'Coque en silicone premium pour iPhone 14. Protection optimale contre les chocs et les rayures.',
            price: 1200,
            categoryId: coques.id,
            images: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800',
            variants: [
                { size: 'iPhone 14', color: '#000000', stock: 15 },
                { size: 'iPhone 14', color: '#0000FF', stock: 12 },
                { size: 'iPhone 14', color: '#FF69B4', stock: 10 },
            ],
        },
        {
            title: 'Coque Samsung Galaxy S23',
            description: 'Coque transparente avec protection renforcée. Design élégant et résistant.',
            price: 1000,
            categoryId: coques.id,
            images: 'https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=800',
            variants: [
                { size: 'Galaxy S23', color: '#FFFFFF', stock: 20 },
                { size: 'Galaxy S23', color: '#000000', stock: 15 },
            ],
        },
        {
            title: 'Coque Universelle Antichoc',
            description: 'Coque universelle avec protection militaire. Compatible avec plusieurs modèles.',
            price: 800,
            categoryId: coques.id,
            images: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800',
            variants: [
                { size: 'Universal', color: '#808080', stock: 25 },
                { size: 'Universal', color: '#000000', stock: 20 },
            ],
        },

        // Câbles et chargeurs
        {
            title: 'Câble USB-C Rapide',
            description: 'Câble USB-C 2m avec charge rapide. Compatible avec tous les appareils USB-C.',
            price: 600,
            categoryId: cables.id,
            images: 'https://images.unsplash.com/photo-1591290619762-125c58c1d44a?w=800',
            variants: [
                { size: '2m', color: '#FFFFFF', stock: 30 },
                { size: '2m', color: '#000000', stock: 25 },
                { size: '1m', color: '#FFFFFF', stock: 20 },
            ],
        },
        {
            title: 'Chargeur Rapide 20W',
            description: 'Chargeur mural rapide 20W. Charge votre téléphone en un temps record.',
            price: 1500,
            categoryId: cables.id,
            images: 'https://images.unsplash.com/photo-1624823183493-ed5832f48f18?w=800',
            variants: [
                { size: '20W', color: '#FFFFFF', stock: 15 },
                { size: '20W', color: '#000000', stock: 12 },
            ],
        },
        {
            title: 'Câble Lightning 3-en-1',
            description: 'Câble universel avec connecteurs Lightning, USB-C et Micro-USB.',
            price: 900,
            categoryId: cables.id,
            images: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800',
            variants: [
                { size: '1.5m', color: '#000000', stock: 18 },
                { size: '1.5m', color: '#0000FF', stock: 15 },
            ],
        },

        // Écouteurs
        {
            title: 'Écouteurs Sans Fil TWS',
            description: 'Écouteurs Bluetooth avec réduction de bruit active. Qualité audio premium.',
            price: 3500,
            categoryId: ecouteurs.id,
            images: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800',
            variants: [
                { size: 'Standard', color: '#FFFFFF', stock: 10 },
                { size: 'Standard', color: '#000000', stock: 15 },
            ],
        },
        {
            title: 'Écouteurs Sport Bluetooth',
            description: 'Écouteurs résistants à l\'eau pour le sport. Autonomie 8h.',
            price: 2200,
            categoryId: ecouteurs.id,
            images: 'https://images.unsplash.com/photo-1577174881658-0f30157732c4?w=800',
            variants: [
                { size: 'Standard', color: '#000000', stock: 12 },
                { size: 'Standard', color: '#FF0000', stock: 8 },
                { size: 'Standard', color: '#0000FF', stock: 10 },
            ],
        },
        {
            title: 'Écouteurs Filaires Premium',
            description: 'Écouteurs filaires avec microphone intégré. Son haute définition.',
            price: 800,
            categoryId: ecouteurs.id,
            images: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800',
            variants: [
                { size: 'Standard', color: '#FFFFFF', stock: 20 },
                { size: 'Standard', color: '#000000', stock: 25 },
            ],
        },

        // Protections d'écran
        {
            title: 'Protection Écran Verre Trempé',
            description: 'Verre trempé ultra-résistant. Protection 9H contre les rayures.',
            price: 500,
            categoryId: protections.id,
            images: 'https://images.unsplash.com/photo-1585790050230-5dd28404f115?w=800',
            variants: [
                { size: 'iPhone 14', color: '#FFFFFF', stock: 30 },
                { size: 'Samsung S23', color: '#FFFFFF', stock: 25 },
                { size: 'Universal', color: '#FFFFFF', stock: 40 },
            ],
        },
        {
            title: 'Film Protection Anti-Bleu',
            description: 'Film de protection avec filtre anti-lumière bleue. Réduit la fatigue oculaire.',
            price: 700,
            categoryId: protections.id,
            images: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800',
            variants: [
                { size: 'iPhone 14', color: '#FFFFFF', stock: 15 },
                { size: 'Samsung S23', color: '#FFFFFF', stock: 12 },
            ],
        },

        // Powerbanks
        {
            title: 'Powerbank 20000mAh',
            description: 'Batterie externe haute capacité. Charge rapide 18W, plusieurs ports USB.',
            price: 4500,
            categoryId: powerbanks.id,
            images: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800',
            variants: [
                { size: '20000mAh', color: '#000000', stock: 8 },
                { size: '20000mAh', color: '#FFFFFF', stock: 6 },
            ],
        },
        {
            title: 'Powerbank Mini 5000mAh',
            description: 'Batterie externe compacte et portable. Parfaite pour les déplacements.',
            price: 2000,
            categoryId: powerbanks.id,
            images: 'https://images.unsplash.com/photo-1607305387299-a3d9611cd469?w=800',
            variants: [
                { size: '5000mAh', color: '#FF69B4', stock: 12 },
                { size: '5000mAh', color: '#87CEEB', stock: 10 },
                { size: '5000mAh', color: '#000000', stock: 15 },
            ],
        },
        {
            title: 'Powerbank Solaire 10000mAh',
            description: 'Batterie avec panneau solaire intégré. Idéale pour les activités outdoor.',
            price: 3500,
            categoryId: powerbanks.id,
            images: 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=800',
            variants: [
                { size: '10000mAh', color: '#FFA500', stock: 7 },
                { size: '10000mAh', color: '#008000', stock: 9 },
            ],
        },
    ];

    // Créer les produits
    for (const productData of products) {
        const { variants, ...data } = productData;
        await prisma.product.create({
            data: {
                ...data,
                storeId: store.id,
                variants: {
                    create: variants,
                },
            },
        });
        console.log(`✓ Créé: ${productData.title}`);
    }

    console.log(`\n✅ ${products.length} produits d'accessoires téléphone ajoutés avec succès!`);
}

main()
    .catch((e) => {
        console.error('❌ Erreur:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
