import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Templates de données par catégorie
const completionTemplates = {
    // Vêtements - Template général
    vetements: {
        material: '100% Coton',
        careInstructions: 'Lavage machine 30°C, Ne pas blanchir, Séchage à l\'air libre recommandé, Repassage à température moyenne',
        warranty: '30 jours - Satisfait ou remboursé',
        dimensions: 'Voir guide des tailles',
    },

    // Électronique
    electronique: {
        warranty: '1 an - Garantie constructeur',
        technicalSpecs: JSON.stringify({
            'Type': 'Électronique',
            'Garantie': '1 an',
            'Notice': 'Incluse'
        }),
    },

    // Maroquinerie
    maroquinerie: {
        material: 'Cuir synthétique de qualité',
        careInstructions: 'Nettoyer avec un chiffon doux et humide, Éviter l\'exposition prolongée au soleil',
        warranty: '6 mois - Garantie qualité',
        dimensions: 'Variables selon modèle',
    },
};

async function completeProductInfo() {
    console.log('🚀 Début de la complétion des informations produits...\n');

    try {
        // Récupérer tous les produits
        const products = await prisma.product.findMany({
            include: {
                Category: true,
                Store: true,
            },
        });

        console.log(`📦 ${products.length} produits à traiter\n`);

        let updatedCount = 0;

        for (const product of products) {
            const updates: any = {};
            let needsUpdate = false;

            // Déterminer la catégorie pour appliquer le bon template
            let template = completionTemplates.vetements; // Par défaut

            if (product.Category) {
                const categoryName = product.Category.name.toLowerCase();

                if (categoryName.includes('électronique') || categoryName.includes('écouteur')) {
                    template = completionTemplates.electronique;
                } else if (categoryName.includes('maroquinerie') || categoryName.includes('sac')) {
                    template = completionTemplates.maroquinerie;
                }
            }

            // Compléter les champs manquants
            if (!product.material && template.material) {
                updates.material = template.material;
                needsUpdate = true;
            }

            if (!product.careInstructions && template.careInstructions) {
                updates.careInstructions = template.careInstructions;
                needsUpdate = true;
            }

            if (!product.warranty && template.warranty) {
                updates.warranty = template.warranty;
                needsUpdate = true;
            }

            if (!product.dimensions && template.dimensions) {
                updates.dimensions = template.dimensions;
                needsUpdate = true;
            }

            if (!product.technicalSpecs && template.technicalSpecs) {
                updates.technicalSpecs = template.technicalSpecs;
                needsUpdate = true;
            }

            // Ajouter des specs techniques spécifiques pour certains produits
            if (product.title.toLowerCase().includes('écouteur')) {
                updates.technicalSpecs = JSON.stringify({
                    'Type': 'Écouteurs sans fil',
                    'Connectivité': 'Bluetooth 5.0',
                    'Autonomie': '24h avec boîtier de charge',
                    'Portée': 'Jusqu\'à 10 mètres',
                    'Charge rapide': 'Oui',
                    'Résistance': 'Résistant aux éclaboussures',
                });
                needsUpdate = true;
            }

            // Mettre à jour le produit si nécessaire
            if (needsUpdate) {
                await prisma.product.update({
                    where: { id: product.id },
                    data: updates,
                });

                updatedCount++;
                console.log(`✅ Mis à jour: ${product.title}`);
                console.log(`   Champs ajoutés: ${Object.keys(updates).join(', ')}\n`);
            } else {
                console.log(`⏭️  Déjà complet: ${product.title}`);
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log(`✨ Complétion terminée !`);
        console.log(`📊 ${updatedCount} produits mis à jour sur ${products.length}`);
        console.log('='.repeat(60));

    } catch (error) {
        console.error('❌ Erreur lors de la complétion:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Exécuter le script
completeProductInfo()
    .then(() => {
        console.log('\n✅ Script terminé avec succès');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Échec du script:', error);
        process.exit(1);
    });
