import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedCategories() {
    console.log('🏗️  Creating hierarchical category structure...');

    // NIVEAU 1 : Catégorie principale - Vêtements
    const vetements = await prisma.category.upsert({
        where: { slug: 'vetements' },
        update: {},
        create: {
            id: 'cat-vetements',
            name: 'Vêtements',
            slug: 'vetements',
            description: 'Toute notre collection de vêtements pour toute la famille',
            icon: '👔',
            order: 1,
            isActive: true,
            isFeatured: true,
            metaTitle: 'Vêtements en ligne - Achrilik',
            metaDescription: 'Découvrez notre collection complète de vêtements pour homme, femme et enfant',
            keywords: ['vêtements', 'mode', 'fashion', 'algérie'],
        },
    });

    console.log('✅ Catégorie principale créée: Vêtements');

    // NIVEAU 2 : Genres
    const homme = await prisma.category.upsert({
        where: { slug: 'homme' },
        update: {},
        create: {
            id: 'cat-homme',
            name: 'Homme',
            slug: 'homme',
            description: 'Mode masculine - Vêtements pour homme',
            icon: '👨',
            parentId: vetements.id,
            order: 1,
            metaTitle: 'Vêtements Homme - Achrilik',
            metaDescription: 'Collection complète de vêtements pour homme',
            keywords: ['homme', 'vêtements homme', 'mode masculine'],
        },
    });

    const femme = await prisma.category.upsert({
        where: { slug: 'femme' },
        update: {},
        create: {
            id: 'cat-femme',
            name: 'Femme',
            slug: 'femme',
            description: 'Mode féminine - Vêtements pour femme',
            icon: '👩',
            parentId: vetements.id,
            order: 2,
            metaTitle: 'Vêtements Femme - Achrilik',
            metaDescription: 'Collection complète de vêtements pour femme',
            keywords: ['femme', 'vêtements femme', 'mode féminine'],
        },
    });

    const enfant = await prisma.category.upsert({
        where: { slug: 'enfant' },
        update: {},
        create: {
            id: 'cat-enfant',
            name: 'Enfant',
            slug: 'enfant',
            description: 'Mode enfantine - Vêtements pour enfants',
            icon: '👶',
            parentId: vetements.id,
            order: 3,
            metaTitle: 'Vêtements Enfant - Achrilik',
            metaDescription: 'Collection complète de vêtements pour enfants',
            keywords: ['enfant', 'vêtements enfant', 'mode enfantine'],
        },
    });

    const sport = await prisma.category.upsert({
        where: { slug: 'sport-activewear' },
        update: {},
        create: {
            id: 'cat-sport',
            name: 'Sport & Activewear',
            slug: 'sport-activewear',
            description: 'Vêtements de sport et fitness',
            icon: '🏃',
            parentId: vetements.id,
            order: 4,
            metaTitle: 'Vêtements Sport - Achrilik',
            metaDescription: 'Collection sport et activewear',
            keywords: ['sport', 'fitness', 'activewear'],
        },
    });

    console.log('✅ Catégories de genre créées: Homme, Femme, Enfant, Sport');

    // NIVEAU 3 : Sous-catégories HOMME
    const hommeCategories = [
        {
            id: 'cat-homme-tshirts',
            name: 'T-Shirts & Polos',
            slug: 'tshirts-polos-homme',
            description: 'T-shirts, polos et hauts pour homme',
            icon: '👕',
            parentId: homme.id,
            order: 1,
            keywords: ['tshirt', 'polo', 'homme'],
        },
        {
            id: 'cat-homme-chemises',
            name: 'Chemises',
            slug: 'chemises-homme',
            description: 'Chemises casual et formelles pour homme',
            icon: '👔',
            parentId: homme.id,
            order: 2,
            keywords: ['chemise', 'homme', 'formel'],
        },
        {
            id: 'cat-homme-pantalons',
            name: 'Pantalons & Jeans',
            slug: 'pantalons-jeans-homme',
            description: 'Pantalons, jeans et bas pour homme',
            icon: '👖',
            parentId: homme.id,
            order: 3,
            keywords: ['pantalon', 'jean', 'homme'],
        },
        {
            id: 'cat-homme-vestes',
            name: 'Vestes & Manteaux',
            slug: 'vestes-manteaux-homme',
            description: 'Vestes, manteaux et vêtements d\'extérieur pour homme',
            icon: '🧥',
            parentId: homme.id,
            order: 4,
            keywords: ['veste', 'manteau', 'homme'],
        },
        {
            id: 'cat-homme-chaussures',
            name: 'Chaussures',
            slug: 'chaussures-homme',
            description: 'Chaussures et baskets pour homme',
            icon: '👟',
            parentId: homme.id,
            order: 5,
            keywords: ['chaussures', 'baskets', 'homme'],
        },
        {
            id: 'cat-homme-accessoires',
            name: 'Accessoires',
            slug: 'accessoires-homme',
            description: 'Accessoires de mode pour homme',
            icon: '🎩',
            parentId: homme.id,
            order: 6,
            keywords: ['accessoires', 'homme'],
        },
    ];

    for (const cat of hommeCategories) {
        await prisma.category.upsert({
            where: { slug: cat.slug },
            update: {},
            create: cat,
        });
    }

    console.log('✅ Sous-catégories Homme créées');

    // NIVEAU 3 : Sous-catégories FEMME
    const femmeCategories = [
        {
            id: 'cat-femme-tops',
            name: 'T-Shirts & Tops',
            slug: 'tshirts-tops-femme',
            description: 'T-shirts, tops et hauts pour femme',
            icon: '👚',
            parentId: femme.id,
            order: 1,
            keywords: ['tshirt', 'top', 'femme'],
        },
        {
            id: 'cat-femme-robes',
            name: 'Robes & Jupes',
            slug: 'robes-jupes-femme',
            description: 'Robes et jupes pour femme',
            icon: '👗',
            parentId: femme.id,
            order: 2,
            keywords: ['robe', 'jupe', 'femme'],
        },
        {
            id: 'cat-femme-pantalons',
            name: 'Pantalons & Jeans',
            slug: 'pantalons-jeans-femme',
            description: 'Pantalons, jeans et leggings pour femme',
            icon: '👖',
            parentId: femme.id,
            order: 3,
            keywords: ['pantalon', 'jean', 'femme'],
        },
        {
            id: 'cat-femme-vestes',
            name: 'Vestes & Blazers',
            slug: 'vestes-blazers-femme',
            description: 'Vestes, blazers et manteaux pour femme',
            icon: '🧥',
            parentId: femme.id,
            order: 4,
            keywords: ['veste', 'blazer', 'femme'],
        },
        {
            id: 'cat-femme-chaussures',
            name: 'Chaussures',
            slug: 'chaussures-femme',
            description: 'Chaussures, talons et baskets pour femme',
            icon: '👠',
            parentId: femme.id,
            order: 5,
            keywords: ['chaussures', 'talons', 'femme'],
        },
        {
            id: 'cat-femme-accessoires',
            name: 'Accessoires',
            slug: 'accessoires-femme',
            description: 'Sacs, bijoux et accessoires pour femme',
            icon: '👜',
            parentId: femme.id,
            order: 6,
            keywords: ['accessoires', 'sac', 'femme'],
        },
    ];

    for (const cat of femmeCategories) {
        await prisma.category.upsert({
            where: { slug: cat.slug },
            update: {},
            create: cat,
        });
    }

    console.log('✅ Sous-catégories Femme créées');

    // NIVEAU 3 : Sous-catégories ENFANT
    const enfantCategories = [
        {
            id: 'cat-enfant-garcon',
            name: 'Garçon (2-14 ans)',
            slug: 'garcon',
            description: 'Vêtements pour garçon',
            icon: '👦',
            parentId: enfant.id,
            order: 1,
            keywords: ['garçon', 'enfant'],
        },
        {
            id: 'cat-enfant-fille',
            name: 'Fille (2-14 ans)',
            slug: 'fille',
            description: 'Vêtements pour fille',
            icon: '👧',
            parentId: enfant.id,
            order: 2,
            keywords: ['fille', 'enfant'],
        },
        {
            id: 'cat-enfant-bebe',
            name: 'Bébé (0-24 mois)',
            slug: 'bebe',
            description: 'Vêtements pour bébé',
            icon: '👶',
            parentId: enfant.id,
            order: 3,
            keywords: ['bébé', 'nourrisson'],
        },
    ];

    for (const cat of enfantCategories) {
        await prisma.category.upsert({
            where: { slug: cat.slug },
            update: {},
            create: cat,
        });
    }

    console.log('✅ Sous-catégories Enfant créées');

    // NIVEAU 3 : Sous-catégories SPORT
    const sportCategories = [
        {
            id: 'cat-sport-homme',
            name: 'Sport Homme',
            slug: 'sport-homme',
            description: 'Vêtements de sport pour homme',
            icon: '🏋️',
            parentId: sport.id,
            order: 1,
            keywords: ['sport', 'homme', 'fitness'],
        },
        {
            id: 'cat-sport-femme',
            name: 'Sport Femme',
            slug: 'sport-femme',
            description: 'Vêtements de sport pour femme',
            icon: '🤸',
            parentId: sport.id,
            order: 2,
            keywords: ['sport', 'femme', 'fitness'],
        },
        {
            id: 'cat-sport-accessoires',
            name: 'Accessoires Sport',
            slug: 'accessoires-sport',
            description: 'Sacs de sport et accessoires',
            icon: '🎽',
            parentId: sport.id,
            order: 3,
            keywords: ['sport', 'accessoires'],
        },
    ];

    for (const cat of sportCategories) {
        await prisma.category.upsert({
            where: { slug: cat.slug },
            update: {},
            create: cat,
        });
    }

    console.log('✅ Sous-catégories Sport créées');

    console.log('🎉 Hiérarchie de catégories complète créée avec succès !');
}

seedCategories()
    .catch((e) => {
        console.error('❌ Erreur lors du seed des catégories:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
