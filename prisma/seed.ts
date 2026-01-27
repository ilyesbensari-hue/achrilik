import { PrismaClient } from '@prisma/client'
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database with complete e-commerce data...');

    // Clear existing data (optional, but good for clean slate if running locally)
    // await prisma.orderItem.deleteMany();
    // await prisma.order.deleteMany();
    // await prisma.variant.deleteMany();
    // await prisma.product.deleteMany();
    // await prisma.category.deleteMany();
    // await prisma.store.deleteMany();
    // await prisma.user.deleteMany();

    // Create demo seller
    const seller = await prisma.user.upsert({
        where: { email: 'demo@achrilik.com' },
        update: {},
        create: {
            id: randomBytes(16).toString('hex'),
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
            id: randomBytes(16).toString('hex'),
            name: 'Fashion Oran',
            description: 'Votre boutique de mode à Oran',
            ownerId: seller.id,
            city: 'Oran',
            latitude: 35.6969,
            longitude: -0.6331,
            address: 'Centre-ville Oran',
        },
    });

    console.log('📁 Creating categories...');

    // Helper to create category
    const createCategory = async (name: string, slug: string, parentId?: string) => {
        // Check if exists to avoid unique constraint errors on re-runs
        const existing = await prisma.category.findUnique({ where: { slug } });
        if (existing) return existing;

        return await prisma.category.create({
            data: {
                id: randomBytes(16).toString('hex'),
                name,
                slug,
                parentId
            }
        });
    };

    // 1. HOMMES
    const hommes = await createCategory('Vêtements Homme', 'hommes');
    await createCategory('T-shirts', 't-shirts-homme', hommes.id);
    await createCategory('Manches courtes', 't-shirts-manches-courtes-homme', hommes.id); // Note: structure implies flattened or nested, sticking to 2-level deeply usually better but let's follow list
    // The user list has sub-sub categories? "T-shirts -> Manches courtes"
    // Let's do: Hommes -> T-shirts -> Manches courtes ?
    // Prisma schema supports infinite nesting.

    // Let's implement the specific structure requested:

    // LEVEL 1: HOMMES
    const tshirtsHomme = await createCategory('T-shirts', 't-shirts-homme', hommes.id);
    await createCategory('Manches courtes', 'manches-courtes-homme', tshirtsHomme.id);
    await createCategory('Manches longues', 'manches-longues-homme', tshirtsHomme.id);
    await createCategory('Oversize', 'oversize-homme', tshirtsHomme.id);

    const chemisesHomme = await createCategory('Chemises', 'chemises-homme', hommes.id);
    await createCategory('Classiques', 'chemises-classiques-homme', chemisesHomme.id);
    await createCategory('Casual', 'chemises-casual-homme', chemisesHomme.id);
    await createCategory('Manches courtes', 'chemises-manches-courtes-homme', chemisesHomme.id);

    const polos = await createCategory('Polos', 'polos-homme', hommes.id);
    const sweats = await createCategory('Sweats & Hoodies', 'sweats-hoodies-homme', hommes.id);

    const vestesHomme = await createCategory('Vestes & Manteaux', 'vestes-manteaux-homme', hommes.id);
    await createCategory('Vestes légères', 'vestes-legeres-homme', vestesHomme.id);
    await createCategory('Manteaux', 'manteaux-homme', vestesHomme.id);
    await createCategory('Doudounes', 'doudounes-homme', vestesHomme.id);

    const pantalonsHomme = await createCategory('Pantalons', 'pantalons-homme', hommes.id);
    await createCategory('Jeans', 'jeans-homme', pantalonsHomme.id);
    await createCategory('Chinos', 'chinos-homme', pantalonsHomme.id);
    await createCategory('Pantalons cargo', 'cargo-homme', pantalonsHomme.id);
    await createCategory('Shorts & Bermudas', 'shorts-bermudas-homme', pantalonsHomme.id);

    await createCategory('Costumes & Blazers', 'costumes-blazers-homme', hommes.id);
    await createCategory('Sous-vêtements', 'sous-vetements-homme', hommes.id);
    await createCategory('Pyjamas & Homewear', 'pyjamas-homewear-homme', hommes.id);
    await createCategory('Vêtements de sport', 'sport-homme', hommes.id);


    // 2. FEMMES
    const femmes = await createCategory('Vêtements Femme', 'femmes');

    const topsFemme = await createCategory('Tops', 'tops-femme', femmes.id);
    await createCategory('T-shirts', 't-shirts-femme', topsFemme.id);
    await createCategory('Débardeurs', 'debardeurs-femme', topsFemme.id);
    await createCategory('Blouses', 'blouses-femme', topsFemme.id);

    const robesFemme = await createCategory('Robes', 'robes-femme', femmes.id);
    await createCategory('Courtes', 'robes-courtes-femme', robesFemme.id);
    await createCategory('Longues', 'robes-longues-femme', robesFemme.id);
    await createCategory('Soirée', 'robes-soiree-femme', robesFemme.id);

    const jupesFemme = await createCategory('Jupes', 'jupes-femme', femmes.id);
    await createCategory('Courtes', 'jupes-courtes-femme', jupesFemme.id);
    await createCategory('Longues', 'jupes-longues-femme', jupesFemme.id);

    const pantalonsFemme = await createCategory('Pantalons', 'pantalons-femme', femmes.id);
    await createCategory('Jeans', 'jeans-femme', pantalonsFemme.id);
    await createCategory('Leggings', 'leggings-femme', pantalonsFemme.id);
    await createCategory('Pantalons taille haute', 'taille-haute-femme', pantalonsFemme.id);
    await createCategory('Combinaisons', 'combinaisons-femme', pantalonsFemme.id);

    await createCategory('Sweats & Pulls', 'sweats-pulls-femme', femmes.id);

    const vestesFemme = await createCategory('Vestes & Manteaux', 'vestes-manteaux-femme', femmes.id);
    await createCategory('Blazers', 'blazers-femme', vestesFemme.id);
    await createCategory('Manteaux', 'manteaux-femme', vestesFemme.id);
    await createCategory('Doudounes', 'doudounes-femme', vestesFemme.id);

    await createCategory('Lingerie', 'lingerie-femme', femmes.id);
    await createCategory('Pyjamas & Homewear', 'pyjamas-femme', femmes.id);
    await createCategory('Vêtements de sport', 'sport-femme', femmes.id);


    // 3. ENFANTS
    const enfants = await createCategory('Vêtements Enfants', 'enfants');

    const bebe = await createCategory('Bébé (0-24 mois)', 'bebe', enfants.id);
    await createCategory('Bodies', 'bodies-bebe', bebe.id);
    await createCategory('Ensembles', 'ensembles-bebe', bebe.id);
    await createCategory('Pyjamas', 'pyjamas-bebe', bebe.id);

    const garcon = await createCategory('Garçon', 'garcon', enfants.id);
    await createCategory('T-shirts', 't-shirts-garcon', garcon.id);
    await createCategory('Pantalons', 'pantalons-garcon', garcon.id);
    await createCategory('Vestes', 'vestes-garcon', garcon.id);

    const fille = await createCategory('Fille', 'fille', enfants.id);
    await createCategory('Robes', 'robes-fille', fille.id);
    await createCategory('Jupes', 'jupes-fille', fille.id);
    await createCategory('T-shirts', 't-shirts-fille', fille.id);

    await createCategory('Unisexe', 'unisexe-enfant', enfants.id);
    await createCategory('Vêtements scolaires', 'scolaire-enfant', enfants.id);
    await createCategory('Vêtements de sport', 'sport-enfant', enfants.id);


    // 4. ACCESSOIRES
    const accessoires = await createCategory('Accessoires', 'accessoires');
    await createCategory('Chapeaux & Casquettes', 'chapeaux-casquettes', accessoires.id);
    await createCategory('Ceintures', 'ceintures', accessoires.id);
    await createCategory('Écharpes & Foulards', 'echarpes-foulards', accessoires.id);
    await createCategory('Gants', 'gants', accessoires.id);

    const lunettes = await createCategory('Lunettes', 'lunettes', accessoires.id);
    await createCategory('Lunettes de soleil', 'lunettes-soleil', lunettes.id);
    await createCategory('Lunettes de vue', 'lunettes-vue', lunettes.id);

    const bijoux = await createCategory('Bijoux', 'bijoux', accessoires.id);
    await createCategory('Colliers', 'colliers', bijoux.id);
    await createCategory('Bracelets', 'bracelets', bijoux.id);
    await createCategory('Boucles d’oreilles', 'boucles-oreilles', bijoux.id);
    await createCategory('Montres', 'montres', bijoux.id);


    // 5. MAROQUINERIE
    const maroquinerie = await createCategory('Maroquinerie', 'maroquinerie');

    const sacs = await createCategory('Sacs', 'sacs', maroquinerie.id);
    await createCategory('Sacs à main', 'sacs-main', sacs.id);
    await createCategory('Sacs à dos', 'sacs-dos', sacs.id);
    await createCategory('Sacs de voyage', 'sacs-voyage', sacs.id);

    await createCategory('Portefeuilles', 'portefeuilles', maroquinerie.id);
    await createCategory('Porte-cartes', 'porte-cartes', maroquinerie.id);
    await createCategory('Porte-monnaie', 'porte-monnaie', maroquinerie.id);
    await createCategory('Trousses', 'trousses', maroquinerie.id);
    await createCategory('Sacoches', 'sacoches', maroquinerie.id);


    // 6. ELECTRONIQUE
    const electronics = await createCategory('Électronique & Tech', 'electronique');

    const phones = await createCategory('Téléphones & Accessoires', 'telephones-accessoires', electronics.id);

    const coques = await createCategory('Coques de téléphone', 'coques', phones.id);
    await createCategory('Silicone', 'coques-silicone', coques.id);
    await createCategory('Rigide', 'coques-rigide', coques.id);
    await createCategory('Anti-choc', 'coques-anti-choc', coques.id);

    await createCategory('Protège-écrans', 'protege-ecrans', phones.id);

    const batteries = await createCategory('Batteries & Énergie', 'batteries-energie', electronics.id);
    await createCategory('Batteries externes (Power Bank)', 'power-banks', batteries.id);
    await createCategory('Câbles de charge', 'cables-charge', batteries.id);
    await createCategory('Chargeurs secteur', 'chargeurs-secteur', batteries.id);
    await createCategory('Chargeurs voiture', 'chargeurs-voiture', batteries.id);

    const audio = await createCategory('Audio', 'audio', electronics.id);
    await createCategory('Écouteurs filaires', 'ecouteurs-filaires', audio.id);
    await createCategory('Écouteurs sans fil', 'ecouteurs-sans-fil', audio.id);
    await createCategory('Casques', 'casques-audio', audio.id);

    const gadgets = await createCategory('Supports & Gadgets', 'supports-gadgets', electronics.id);
    await createCategory('Supports téléphone', 'supports-telephone', gadgets.id);
    await createCategory('Anneaux de maintien', 'anneaux-maintien', gadgets.id);


    // Sample products
    console.log('📦 Creating sample products...');

    const products = [
        // Robes
        {
            title: 'Robe Kabyle Moderne',
            description: 'Magnifique robe traditionnelle avec des touches modernes.',
            price: 12000,
            categoryId: robesFemme.id, // Direct assignment to strict category
            images: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800',
            variants: [
                { size: 'S', color: '#FF69B4', stock: 5 },
                { size: 'M', color: '#FF69B4', stock: 8 },
                { size: 'L', color: '#FF1493', stock: 3 },
            ],
        },
        // T-shirts Homme
        {
            title: 'T-shirt Oversize Streetwear',
            description: 'T-shirt oversize en coton lourd.',
            price: 2800,
            categoryId: tshirtsHomme.id, // Or subcat 'oversize-homme'
            images: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800',
            variants: [
                { size: 'M', color: '#000000', stock: 10 },
                { size: 'L', color: '#000000', stock: 15 },
                { size: 'XL', color: '#000000', stock: 12 },
            ],
        },
        // Tech
        {
            title: 'Écouteurs Sans Fil Pro',
            description: 'Qualité sonore exceptionnelle avec réduction de bruit.',
            price: 4500,
            categoryId: audio.id, // Or subcat
            images: 'https://images.unsplash.com/photo-1572569028738-411a1971d6c9?w=800',
            variants: [
                { size: 'Unique', color: '#FFFFFF', stock: 20 },
                { size: 'Unique', color: '#000000', stock: 15 },
            ],
        }
        // Add more sample products if needed, but these suffice for testing structure
    ];

    for (const productData of products) {
        const { variants, ...data } = productData;

        // FIX: Generated unique ID for EACH product.
        const productId = randomBytes(16).toString('hex');

        await prisma.product.create({
            data: {
                id: productId,
                ...data,
                storeId: store.id,
                Variant: {
                    create: variants.map(v => ({ ...v, id: randomBytes(16).toString('hex') })),
                },
            },
        });
    }

    console.log('✅ Seeding completed!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
