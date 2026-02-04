import { PrismaClient } from '@prisma/client';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

async function fixVariants() {
    console.log('🔧 Correction des produits sans variants...\n');

    try {
        // Trouver tous les produits sans variants
        const products = await prisma.product.findMany({
            include: {
                Variant: true
            }
        });

        const productsWithoutVariants = products.filter(p => p.Variant.length === 0);

        console.log(`✓ ${products.length} produits au total`);
        console.log(`⚠️  ${productsWithoutVariants.length} produits SANS variants\n`);

        if (productsWithoutVariants.length === 0) {
            console.log('✅ Tous les produits ont au moins un variant!\n');
            return;
        }

        // Corriger chaque produit
        for (const product of productsWithoutVariants) {
            console.log(`📦 Traitement: ${product.title}`);

            // Variants par défaut selon le type de produit
            let variants = [];

            if (product.title.toLowerCase().includes('chaussure')) {
                // Chaussures: tailles numériques
                variants = [
                    { size: '38', color: 'Standard', stock: 10 },
                    { size: '39', color: 'Standard', stock: 12 },
                    { size: '40', color: 'Standard', stock: 15 },
                    { size: '41', color: 'Standard', stock: 12 },
                    { size: '42', color: 'Standard', stock: 10 },
                ];
            } else if (product.title.toLowerCase().includes('t-shirt') ||
                product.title.toLowerCase().includes('shirt') ||
                product.title.toLowerCase().includes('robe')) {
                // Vêtements: tailles S-XL
                variants = [
                    { size: 'S', color: 'Standard', stock: 15 },
                    { size: 'M', color: 'Standard', stock: 20 },
                    { size: 'L', color: 'Standard', stock: 18 },
                    { size: 'XL', color: 'Standard', stock: 12 },
                ];
            } else {
                // Autres produits: taille unique
                variants = [
                    { size: 'Standard', color: 'Standard', stock: 25 }
                ];
            }

            // Créer les variants
            for (const variant of variants) {
                await prisma.variant.create({
                    data: {
                        id: randomBytes(16).toString('hex'),
                        productId: product.id,
                        ...variant,
                        isAvailable: true
                    }
                });
            }

            console.log(`   ✅ ${variants.length} variant(s) ajouté(s)\n`);
        }

        console.log('✅ Tous les produits ont maintenant au moins un variant!');

    } catch (error) {
        console.error('❌ Erreur:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

fixVariants();
