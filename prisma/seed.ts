import { PrismaClient } from '@prisma/client'
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database with complete e-commerce data...');

    // Create demo seller
    const seller = await prisma.user.upsert({
        where: { email: 'demo@achrilik.com' },
        update: {},
        create: {
            id: randomBytes(16).toString('hex'), // Generate ID
            email: 'demo@achrilik.com',
            password: 'demo123',
            name: 'Fashion DZ Store',
            role: 'SELLER',
        },
    });

    // Create store
    const store = await prisma.store.upsert({
        where: { ownerId: seller.id },
        update: {},
        create: {
            name: 'Fashion Oran',
            description: 'Votre boutique de mode à Oran',
            ownerId: seller.id,
            city: 'Oran',
            latitude: 35.6969,
            longitude: -0.6331,
            address: 'Centre-ville Oran',
        },
    });

    // Create categories
    console.log('📁 Creating categories...');

    // Main categories
    const femmes = await prisma.category.create({
        data: { name: 'Femmes', slug: 'femmes' },
    });

    const hommes = await prisma.category.create({
        data: { name: 'Hommes', slug: 'hommes' },
    });

    const enfants = await prisma.category.create({
        data: { name: 'Enfants', slug: 'enfants' },
    });

    const accessoires = await prisma.category.create({
        data: { name: 'Accessoires', slug: 'accessoires' },
    });

    // Subcategories - Femmes
    const robes = await prisma.category.create({
        data: { name: 'Robes', slug: 'robes', parentId: femmes.id },
    });

    const hauts = await prisma.category.create({
        data: { name: 'Hauts & Chemisiers', slug: 'hauts-chemisiers', parentId: femmes.id },
    });

    const pantalonsFemmes = await prisma.category.create({
        data: { name: 'Pantalons & Jeans', slug: 'pantalons-jeans-femmes', parentId: femmes.id },
    });

    const pullsFemmes = await prisma.category.create({
        data: { name: 'Pulls & Cardigans', slug: 'pulls-cardigans-femmes', parentId: femmes.id },
    });

    // Subcategories - Hommes
    const tshirts = await prisma.category.create({
        data: { name: 'T-shirts & Polos', slug: 'tshirts-polos', parentId: hommes.id },
    });

    const chemises = await prisma.category.create({
        data: { name: 'Chemises', slug: 'chemises', parentId: hommes.id },
    });

    const pantalonsHommes = await prisma.category.create({
        data: { name: 'Pantalons & Jeans', slug: 'pantalons-jeans-hommes', parentId: hommes.id },
    });

    const pullsHommes = await prisma.category.create({
        data: { name: 'Pulls & Sweats', slug: 'pulls-sweats-hommes', parentId: hommes.id },
    });

    // Subcategories - Accessoires
    const sacs = await prisma.category.create({
        data: { name: 'Sacs à Main', slug: 'sacs-main', parentId: accessoires.id },
    });

    const chaussures = await prisma.category.create({
        data: { name: 'Chaussures', slug: 'chaussures', parentId: accessoires.id },
    });

    const montres = await prisma.category.create({
        data: { name: 'Montres', slug: 'montres', parentId: accessoires.id },
    });

    // Sample products
    console.log('📦 Creating 40 sample products...');

    const products = [
        // Robes
        {
            title: 'Robe Kabyle Moderne',
            description: 'Magnifique robe traditionnelle avec des touches modernes. Parfaite pour les occasions spéciales.',
            price: 12000,
            categoryId: robes.id,
            images: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800',
            variants: [
                { size: 'S', color: '#FF69B4', stock: 5 },
                { size: 'M', color: '#FF69B4', stock: 8 },
                { size: 'L', color: '#FF1493', stock: 3 },
            ],
        },
        {
            title: 'Robe d\'Été Légère',
            description: 'Robe fluide et légère, parfaite pour l\'été algérien.',
            price: 5500,
            categoryId: robes.id,
            images: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800',
            variants: [
                { size: 'S', color: '#FFB6C1', stock: 8 },
                { size: 'M', color: '#FFB6C1', stock: 12 },
                { size: 'L', color: '#FFDAB9', stock: 6 },
            ],
        },
        {
            title: 'Robe de Soirée Élégante',
            description: 'Robe longue pour vos soirées spéciales.',
            price: 15000,
            categoryId: robes.id,
            images: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800',
            variants: [
                { size: 'S', color: '#000000', stock: 4 },
                { size: 'M', color: '#800020', stock: 5 },
                { size: 'L', color: '#000000', stock: 3 },
            ],
        },

        // Hauts & Chemisiers
        {
            title: 'Chemisier en Soie',
            description: 'Chemisier élégant en soie pour le bureau ou les sorties.',
            price: 4800,
            categoryId: hauts.id,
            images: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=800',
            variants: [
                { size: 'S', color: '#FFFFFF', stock: 10 },
                { size: 'M', color: '#FFC0CB', stock: 8 },
                { size: 'L', color: '#87CEEB', stock: 6 },
            ],
        },
        {
            title: 'Top Casual Coton',
            description: 'Top confortable pour tous les jours.',
            price: 2500,
            categoryId: hauts.id,
            images: 'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=800',
            variants: [
                { size: 'S', color: '#FFFFFF', stock: 15 },
                { size: 'M', color: '#000000', stock: 12 },
                { size: 'L', color: '#808080', stock: 10 },
            ],
        },

        // Pantalons Femmes
        {
            title: 'Jean Femme Taille Haute',
            description: 'Jean stretch confortable, coupe moderne.',
            price: 6800,
            categoryId: pantalonsFemmes.id,
            images: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800',
            variants: [
                { size: 'S', color: '#000080', stock: 6 },
                { size: 'M', color: '#000080', stock: 12 },
                { size: 'L', color: '#4169E1', stock: 4 },
            ],
        },
        {
            title: 'Pantalon Chino Femme',
            description: 'Pantalon élégant pour le bureau.',
            price: 5200,
            categoryId: pantalonsFemmes.id,
            images: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800',
            variants: [
                { size: '36', color: '#000000', stock: 8 },
                { size: '38', color: '#000000', stock: 10 },
                { size: '40', color: '#D2B48C', stock: 7 },
            ],
        },

        // Pulls Femmes
        {
            title: 'Pull en Laine Doux',
            description: 'Pull chaud et confortable pour l\'hiver.',
            price: 7500,
            categoryId: pullsFemmes.id,
            images: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800',
            variants: [
                { size: 'S', color: '#F5DEB3', stock: 6 },
                { size: 'M', color: '#808080', stock: 9 },
                { size: 'L', color: '#800020', stock: 5 },
            ],
        },
        {
            title: 'Cardigan Long',
            description: 'Cardigan élégant pour compléter votre look.',
            price: 6200,
            categoryId: pullsFemmes.id,
            images: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800',
            variants: [
                { size: 'S', color: '#000000', stock: 7 },
                { size: 'M', color: '#A0522D', stock: 8 },
                { size: 'L', color: '#696969', stock: 6 },
            ],
        },

        // T-shirts & Polos Hommes
        {
            title: 'T-shirt Basique Premium',
            description: 'T-shirt en coton de qualité supérieure.',
            price: 2200,
            categoryId: tshirts.id,
            images: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
            variants: [
                { size: 'M', color: '#FFFFFF', stock: 20 },
                { size: 'L', color: '#000000', stock: 18 },
                { size: 'XL', color: '#808080', stock: 15 },
            ],
        },
        {
            title: 'Polo Classique',
            description: 'Polo élégant pour un look décontracté chic.',
            price: 3500,
            categoryId: tshirts.id,
            images: 'https://images.unsplash.com/photo-1611312449408-fcece27cdbb7?w=800',
            variants: [
                { size: 'M', color: '#000080', stock: 12 },
                { size: 'L', color: '#FFFFFF', stock: 14 },
                { size: 'XL', color: '#8B0000', stock: 10 },
            ],
        },

        // Chemises Hommes
        {
            title: 'Chemise Homme Élégante',
            description: 'Chemise en coton premium, coupe slim.',
            price: 4500,
            categoryId: chemises.id,
            images: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800',
            variants: [
                { size: 'M', color: '#FFFFFF', stock: 10 },
                { size: 'L', color: '#FFFFFF', stock: 7 },
                { size: 'XL', color: '#87CEEB', stock: 5 },
            ],
        },
        {
            title: 'Chemise à Carreaux',
            description: 'Chemise décontractée pour le week-end.',
            price: 3800,
            categoryId: chemises.id,
            images: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800',
            variants: [
                { size: 'M', color: '#0000FF', stock: 8 },
                { size: 'L', color: '#FF0000', stock: 9 },
                { size: 'XL', color: '#008000', stock: 6 },
            ],
        },

        // Pantalons Hommes
        {
            title: 'Jean Homme Slim',
            description: 'Jean coupe slim moderne et confortable.',
            price: 7200,
            categoryId: pantalonsHommes.id,
            images: 'https://images.unsplash.com/photo-1542272454315-7f6fabf73b8e?w=800',
            variants: [
                { size: '30', color: '#000080', stock: 8 },
                { size: '32', color: '#000080', stock: 12 },
                { size: '34', color: '#000000', stock: 10 },
            ],
        },
        {
            title: 'Pantalon Chino Homme',
            description: 'Pantalon chino élégant pour toutes occasions.',
            price: 5800,
            categoryId: pantalonsHommes.id,
            images: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800',
            variants: [
                { size: '30', color: '#D2B48C', stock: 7 },
                { size: '32', color: '#000080', stock: 10 },
                { size: '34', color: '#696969', stock: 8 },
            ],
        },

        // Pulls Hommes
        {
            title: 'Pull Col Rond',
            description: 'Pull classique en laine mérinos.',
            price: 8500,
            categoryId: pullsHommes.id,
            images: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800',
            variants: [
                { size: 'M', color: '#000080', stock: 8 },
                { size: 'L', color: '#808080', stock: 10 },
                { size: 'XL', color: '#000000', stock: 6 },
            ],
        },
        {
            title: 'Sweat à Capuche',
            description: 'Sweat confortable pour les journées décontractées.',
            price: 6500,
            categoryId: pullsHommes.id,
            images: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800',
            variants: [
                { size: 'M', color: '#808080', stock: 12 },
                { size: 'L', color: '#000000', stock: 15 },
                { size: 'XL', color: '#000080', stock: 10 },
            ],
        },
        {
            title: 'Veste en Jean Homme',
            description: 'Veste en denim classique, style intemporel.',
            price: 9500,
            categoryId: pullsHommes.id,
            images: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800',
            variants: [
                { size: 'M', color: '#4682B4', stock: 4 },
                { size: 'L', color: '#4682B4', stock: 6 },
                { size: 'XL', color: '#000080', stock: 3 },
            ],
        },

        // Enfants
        {
            title: 'T-Shirt Enfant Coloré',
            description: 'T-shirt en coton doux pour enfants.',
            price: 1800,
            categoryId: enfants.id,
            images: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=800',
            variants: [
                { size: 'S', color: '#FF6347', stock: 15 },
                { size: 'M', color: '#32CD32', stock: 10 },
                { size: 'L', color: '#FFD700', stock: 8 },
            ],
        },
        {
            title: 'Pantalon Jogging Enfant',
            description: 'Pantalon de jogging confortable pour enfants.',
            price: 2500,
            categoryId: enfants.id,
            images: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=800',
            variants: [
                { size: 'S', color: '#808080', stock: 10 },
                { size: 'M', color: '#000000', stock: 15 },
                { size: 'L', color: '#000000', stock: 8 },
            ],
        },

        // Sacs
        {
            title: 'Sac à Main Cuir',
            description: 'Sac à main en cuir véritable, élégant et spacieux.',
            price: 8500,
            categoryId: sacs.id,
            images: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800',
            variants: [
                { size: 'M', color: '#8B4513', stock: 5 },
                { size: 'M', color: '#000000', stock: 7 },
            ],
        },
        {
            title: 'Sac Bandoulière',
            description: 'Sac pratique pour tous les jours.',
            price: 5200,
            categoryId: sacs.id,
            images: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800',
            variants: [
                { size: 'M', color: '#8B4513', stock: 8 },
                { size: 'M', color: '#FF69B4', stock: 6 },
                { size: 'M', color: '#000000', stock: 10 },
            ],
        },

        // Chaussures
        {
            title: 'Baskets Sport Homme',
            description: 'Baskets confortables pour le sport et le quotidien.',
            price: 7200,
            categoryId: chaussures.id,
            images: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
            variants: [
                { size: '40', color: '#FFFFFF', stock: 4 },
                { size: '41', color: '#FFFFFF', stock: 6 },
                { size: '42', color: '#000000', stock: 8 },
                { size: '43', color: '#000000', stock: 3 },
            ],
        },
        {
            title: 'Escarpins Femme',
            description: 'Escarpins élégants pour vos soirées.',
            price: 6800,
            categoryId: chaussures.id,
            images: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800',
            variants: [
                { size: '36', color: '#000000', stock: 5 },
                { size: '37', color: '#FF0000', stock: 6 },
                { size: '38', color: '#000000', stock: 7 },
                { size: '39', color: '#FF69B4', stock: 4 },
            ],
        },

        // Montres
        {
            title: 'Montre Élégante',
            description: 'Montre classique avec bracelet en acier inoxydable.',
            price: 15000,
            categoryId: montres.id,
            images: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800',
            variants: [
                { size: 'M', color: '#C0C0C0', stock: 5 },
                { size: 'M', color: '#FFD700', stock: 3 },
            ],
        },
        {
            title: 'Montre Sport',
            description: 'Montre digitale pour les sportifs.',
            price: 8500,
            categoryId: montres.id,
            images: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
            variants: [
                { size: 'M', color: '#000000', stock: 8 },
                { size: 'M', color: '#0000FF', stock: 6 },
                { size: 'M', color: '#FF0000', stock: 5 },
            ],
        },
    ];

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
    }

    console.log('✅ Seeding completed!');
    console.log(`Created ${products.length} products across multiple categories`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
