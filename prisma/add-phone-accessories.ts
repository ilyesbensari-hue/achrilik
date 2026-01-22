import { PrismaClient } from '@prisma/client';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

async function main() {
    console.log('📱 Ajout des sous-catégories d\'accessoires téléphone...');

    // Trouver la catégorie Accessoires
    const accessoires = await prisma.category.findUnique({
        where: { slug: 'accessoires' }
    });

    if (!accessoires) {
        console.error('❌ Catégorie Accessoires introuvable');
        return;
    }

    console.log('✓ Catégorie Accessoires trouvée');

    // Créer les sous-catégories d'accessoires téléphone
    const categories = [
        { name: 'Coques de Téléphone', slug: 'coques-telephone' },
        { name: 'Câbles & Chargeurs', slug: 'cables-chargeurs' },
        { name: 'Écouteurs & Écouteurs Sans Fil', slug: 'ecouteurs-audio' },
        { name: 'Protections d\'Écran', slug: 'protections-ecran' },
        { name: 'Support & Accessoires Auto', slug: 'supports-auto' },
        { name: 'Powerbanks', slug: 'powerbanks' },
    ];

    for (const cat of categories) {
        // Vérifier si la catégorie existe déjà
        const existing = await prisma.category.findUnique({
            where: { slug: cat.slug }
        });

        if (existing) {
            console.log(`⚠️  ${cat.name} existe déjà, ignoré`);
            continue;
        }

        // Créer la nouvelle sous-catégorie
        await prisma.category.create({
            data: {
                id: randomBytes(16).toString('hex'), // Generate ID
                name: cat.name,
                slug: cat.slug,
                parentId: accessoires.id,
            }
        });
        console.log(`✓ Créé: ${cat.name}`);
    }

    console.log('\n✅ Sous-catégories d\'accessoires téléphone ajoutées avec succès!');
}

main()
    .catch((e) => {
        console.error('❌ Erreur:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
