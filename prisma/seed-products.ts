import { PrismaClient } from '@prisma/client';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

async function seedProducts() {
    console.log('🛍️  Creating test products...');

    // First, get or create a test store
    let store = await prisma.store.findFirst();

    if (!store) {
        // Create a test user first
        const testUser = await prisma.user.upsert({
            where: { email: 'seller@test.com' },
            update: {},
            create: {
                id: randomBytes(16).toString('hex'),
                email: 'seller@test.com',
                password: '$2a$10$YourHashedPasswordHere', // bcrypt hash
                name: 'Boutique Test',
                role: 'SELLER'
            }
        });

        // Create a test store
        store = await prisma.store.create({
            data: {
                id: randomBytes(16).toString('hex'),
                name: 'Achrilik Store',
                description: 'Boutique de vêtements de qualité',
                ownerId: testUser.id,
                address: 'Rue de la Mode, Oran',
                city: 'Oran',
                phone: '0550123456',
                clickCollect: true
            }
        });
    }

    // Get categories
    const categories = await prisma.category.findMany({
        where: {
            parentId: { not: null } // Only get subcategories (level 2 and 3)
        }
    });

    if (categories.length === 0) {
        console.log('❌ No categories found. Please run seed-categories.ts first.');
        return;
    }

    // Sample products data
    const productsData = [
        // T-Shirts Homme
        {
            title: 'T-Shirt Col Rond Noir',
            description: 'T-shirt basique en coton 100% pour homme. Confortable et durable.',
            price: 1500,
            images: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
            categorySlug: 'tshirts-polos-homme',
            neckline: 'Col rond',
            pattern: 'Uni',
            material: '100% Coton',
            fit: 'Regular',
            length: 'Manches courtes',
            careInstructions: 'Lavage machine 30°',
            brand: 'Achrilik Original',
            quality: 'Standard',
            countryOfManufacture: 'Algérie',
            availableSizes: ['S', 'M', 'L', 'XL'],
            badges: ['Made in Algeria'],
            isNew: true,
            isTrending: true
        },
        {
            title: 'T-Shirt Col V Blanc',
            description: 'T-shirt élégant col V en coton premium.',
            price: 1800,
            images: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=500',
            categorySlug: 'tshirts-polos-homme',
            neckline: 'Col V',
            pattern: 'Uni',
            material: '100% Coton Bio',
            fit: 'Slim',
            length: 'Manches courtes',
            careInstructions: 'Lavage machine 30°, Ne pas repasser',
            brand: 'Achrilik Premium',
            quality: 'Premium',
            countryOfManufacture: 'Algérie',
            availableSizes: ['S', 'M', 'L', 'XL'],
            badges: ['Éco-responsable', 'Made in Algeria'],
            isNew: true,
            isBestSeller: true
        },
        // Robes Femme
        {
            title: 'Robe Longue Fleurie',
            description: 'Robe longue élégante avec motif floral. Parfaite pour l\'été.',
            price: 4500,
            images: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500',
            categorySlug: 'robes-jupes-femme',
            neckline: 'Col rond',
            pattern: 'Fleuri',
            closure: 'Zip',
            material: '95% Polyester, 5% Élasthanne',
            fit: 'Ample',
            length: 'Longueur cheville',
            careInstructions: 'Lavage machine 30°, Séchage à plat',
            brand: 'Achrilik Femme',
            quality: 'Premium',
            countryOfManufacture: 'Turquie',
            availableSizes: ['36', '38', '40', '42'],
            badges: ['Nouveauté', 'Qualité Premium'],
            isNew: true,
            isTrending: true,
            promotionLabel: '-20%'
        },
        {
            title: 'Robe Courte Noire',
            description: 'Petite robe noire classique. Indispensable dans toute garde-robe.',
            price: 3500,
            images: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=500',
            categorySlug: 'robes-jupes-femme',
            neckline: 'Col V',
            pattern: 'Uni',
            closure: 'Zip',
            material: '100% Coton',
            fit: 'Ajusté',
            length: 'Au-dessus du genou',
            careInstructions: 'Lavage machine 30°',
            brand: 'Achrilik Femme',
            quality: 'Standard',
            countryOfManufacture: 'Algérie',
            availableSizes: ['36', '38', '40', '42', '44'],
            badges: ['Made in Algeria'],
            isBestSeller: true
        },
        // Pantalons Homme
        {
            title: 'Jean Slim Bleu Foncé',
            description: 'Jean slim fit confortable avec stretch. Coupe moderne.',
            price: 3800,
            images: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500',
            categorySlug: 'pantalons-jeans-homme',
            pattern: 'Uni',
            closure: 'Boutons',
            pockets: '5 poches',
            material: '98% Coton, 2% Élasthanne',
            fit: 'Slim',
            length: 'Longueur cheville',
            careInstructions: 'Lavage machine 30°, Ne pas sécher au sèche-linge',
            brand: 'Achrilik Denim',
            quality: 'Premium',
            countryOfManufacture: 'Turquie',
            availableSizes: ['28', '30', '32', '34', '36'],
            badges: ['Qualité Premium'],
            isTrending: true
        },
        // T-Shirts Femme
        {
            title: 'Top Rayé Blanc et Bleu',
            description: 'Top léger à rayures marinières. Style casual chic.',
            price: 1600,
            images: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500',
            categorySlug: 'tshirts-tops-femme',
            neckline: 'Col rond',
            pattern: 'Rayé',
            material: '100% Coton',
            fit: 'Regular',
            length: 'Manches courtes',
            careInstructions: 'Lavage machine 30°',
            brand: 'Achrilik Femme',
            quality: 'Standard',
            countryOfManufacture: 'Algérie',
            availableSizes: ['S', 'M', 'L'],
            badges: ['Made in Algeria'],
            isNew: true
        },
        // Vêtements Enfant
        {
            title: 'T-Shirt Enfant Imprimé Dinosaure',
            description: 'T-shirt amusant pour enfants avec imprimé dinosaure coloré.',
            price: 1200,
            images: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=500',
            categorySlug: 'garcon',
            neckline: 'Col rond',
            pattern: 'Imprimé',
            material: '100% Coton',
            fit: 'Regular',
            length: 'Manches courtes',
            careInstructions: 'Lavage machine 30°',
            brand: 'Achrilik Kids',
            quality: 'Standard',
            countryOfManufacture: 'Algérie',
            availableSizes: ['4 ans', '6 ans', '8 ans', '10 ans'],
            badges: ['Made in Algeria'],
            isNew: true,
            isBestSeller: true
        },
        {
            title: 'Robe Fille Rose à Pois',
            description: 'Jolie robe rose avec motif à pois blancs. Parfaite pour les occasions spéciales.',
            price: 2500,
            images: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=500',
            categorySlug: 'fille',
            neckline: 'Col rond',
            pattern: 'À pois',
            closure: 'Zip',
            material: '100% Coton',
            fit: 'Regular',
            length: 'Au genou',
            careInstructions: 'Lavage machine 30°',
            brand: 'Achrilik Kids',
            quality: 'Premium',
            countryOfManufacture: 'Algérie',
            availableSizes: ['4 ans', '6 ans', '8 ans'],
            badges: ['Made in Algeria', 'Qualité Premium'],
            isNew: true
        },
        // Sport
        {
            title: 'Legging Sport Noir',
            description: 'Legging de sport haute performance avec technologie anti-transpiration.',
            price: 2800,
            images: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=500',
            categorySlug: 'sport-femme',
            pattern: 'Uni',
            material: '88% Polyester, 12% Élasthanne',
            fit: 'Ajusté',
            length: 'Longueur cheville',
            careInstructions: 'Lavage machine 30°, Séchage rapide',
            brand: 'Achrilik Sport',
            quality: 'Premium',
            countryOfManufacture: 'Chine',
            availableSizes: ['XS', 'S', 'M', 'L'],
            badges: ['Qualité Premium'],
            isTrending: true,
            promotionLabel: 'PROMO'
        }
    ];

    let createdCount = 0;

    for (const productData of productsData) {
        // Find category by slug
        const category = categories.find(c => c.slug === productData.categorySlug);

        if (!category) {
            console.log(`⚠️  Category ${productData.categorySlug} not found, skipping product: ${productData.title}`);
            continue;
        }

        // Create product
        const product = await prisma.product.create({
            data: {
                title: productData.title,
                description: productData.description,
                price: productData.price,
                images: productData.images,
                categoryId: category.id,
                storeId: store.id,
                status: 'APPROVED', // Auto-approve test products
                // Enhanced fields
                neckline: productData.neckline || null,
                pattern: productData.pattern || null,
                closure: productData.closure || null,
                pockets: productData.pockets || null,
                material: productData.material || null,
                fit: productData.fit || null,
                length: productData.length || null,
                careInstructions: productData.careInstructions || null,
                brand: productData.brand || null,
                countryOfManufacture: productData.countryOfManufacture || null,
                availableSizes: productData.availableSizes || [],
                badges: productData.badges || [],
                isNew: productData.isNew || false,
                isTrending: productData.isTrending || false,
                isBestSeller: productData.isBestSeller || false,
                promotionLabel: productData.promotionLabel || null
            }
        });

        // Create variants (sizes and colors)
        const colors = [
            { name: 'Noir', hex: '#000000' },
            { name: 'Blanc', hex: '#FFFFFF' },
            { name: 'Bleu', hex: '#0066CC' }
        ];

        const sizes = productData.availableSizes || ['M', 'L'];

        for (const size of sizes) {
            for (const color of colors.slice(0, 2)) { // Only 2 colors per product
                await prisma.variant.create({
                    data: {
                        productId: product.id,
                        size: size,
                        color: color.name,
                        colorHex: color.hex,
                        stock: Math.floor(Math.random() * 50) + 10, // Random stock 10-60
                        sku: `ACH-${product.id.substring(0, 4)}-${size}-${color.name.toUpperCase()}`
                    }
                });
            }
        }

        createdCount++;
        console.log(`✅ Created: ${productData.title}`);
    }

    console.log(`\n🎉 Successfully created ${createdCount} products with variants!`);
}

seedProducts()
    .catch((e) => {
        console.error('❌ Error seeding products:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
