import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function auditAndFixProducts() {
    console.log('🔍 Starting product database audit...\n');

    try {
        // 1. Get all products
        const allProducts = await prisma.product.findMany({
            include: {
                Category: true,
                Store: true,
                Variant: true
            }
        });

        console.log(`📦 Total products in database: ${allProducts.length}\n`);

        // 2. Get all categories
        const allCategories = await prisma.category.findMany({
            include: {
                Category: true // Parent category
            }
        });

        console.log(`📁 Total categories: ${allCategories.length}\n`);

        // 3. Analyze products without categories
        const productsWithoutCategory = allProducts.filter(p => !p.categoryId);
        console.log(`⚠️  Products without category: ${productsWithoutCategory.length}`);

        if (productsWithoutCategory.length > 0) {
            console.log('\nProducts without category:');
            productsWithoutCategory.forEach(p => {
                console.log(`  - ${p.title} (ID: ${p.id})`);
            });
        }

        // 4. Analyze products by category
        console.log('\n📊 Products by category:');
        const categoryStats = new Map<string, number>();

        allProducts.forEach(p => {
            if (p.Category) {
                const catName = p.Category.name;
                categoryStats.set(catName, (categoryStats.get(catName) || 0) + 1);
            }
        });

        categoryStats.forEach((count, catName) => {
            console.log(`  - ${catName}: ${count} products`);
        });

        // 5. Identify promotions (products with discountPrice)
        const promoProducts = allProducts.filter(p => p.discountPrice && p.discountPrice < p.price);
        console.log(`\n🏷️  Products with promotions: ${promoProducts.length}`);

        if (promoProducts.length > 0) {
            console.log('\nPromotion products:');
            promoProducts.forEach(p => {
                const discount = Math.round(((p.price - (p.discountPrice || 0)) / p.price) * 100);
                console.log(`  - ${p.title}: ${p.price} DA → ${p.discountPrice} DA (-${discount}%)`);
            });
        }

        // 6. Identify new products (created in last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const newProducts = allProducts.filter(p => new Date(p.createdAt) > thirtyDaysAgo);
        console.log(`\n✨ New products (last 30 days): ${newProducts.length}`);

        if (newProducts.length > 0) {
            console.log('\nNew products:');
            newProducts.forEach(p => {
                const daysAgo = Math.floor((Date.now() - new Date(p.createdAt).getTime()) / (1000 * 60 * 60 * 24));
                console.log(`  - ${p.title} (${daysAgo} days ago)`);
            });
        }

        // 7. Auto-categorize products without category based on title/description
        console.log('\n🔧 Auto-categorizing products...');

        const categoryKeywords = {
            'homme': ['homme', 'masculin', 'men', 'garçon'],
            'femme': ['femme', 'féminin', 'women', 'fille', 'robe', 'jupe'],
            'enfant': ['enfant', 'bébé', 'baby', 'kids', 'garçon', 'fille'],
            'accessoires': ['accessoire', 'bijou', 'montre', 'casque', 'écouteur', 'sac'],
            'electronique': ['électronique', 'téléphone', 'phone', 'tech', 'gadget'],
            'maroquinerie': ['sac', 'bagage', 'portefeuille', 'valise']
        };

        let categorized = 0;

        for (const product of productsWithoutCategory) {
            const searchText = `${product.title} ${product.description}`.toLowerCase();

            // Find matching category
            for (const [categorySlug, keywords] of Object.entries(categoryKeywords)) {
                if (keywords.some(keyword => searchText.includes(keyword))) {
                    // Find the category in database
                    const category = allCategories.find(c =>
                        c.slug?.includes(categorySlug) ||
                        c.name.toLowerCase().includes(categorySlug)
                    );

                    if (category) {
                        await prisma.product.update({
                            where: { id: product.id },
                            data: { categoryId: category.id }
                        });
                        console.log(`  ✅ Categorized "${product.title}" → ${category.name}`);
                        categorized++;
                        break;
                    }
                }
            }
        }

        console.log(`\n✅ Auto-categorized ${categorized} products`);

        // 8. Add promotionLabel to products with discounts
        console.log('\n🏷️  Adding promotion labels...');
        let promoLabelsAdded = 0;

        for (const product of promoProducts) {
            if (!product.promotionLabel) {
                const discount = Math.round(((product.price - (product.discountPrice || 0)) / product.price) * 100);
                await prisma.product.update({
                    where: { id: product.id },
                    data: { promotionLabel: `-${discount}%` }
                });
                console.log(`  ✅ Added promo label to "${product.title}": -${discount}%`);
                promoLabelsAdded++;
            }
        }

        console.log(`\n✅ Added ${promoLabelsAdded} promotion labels`);

        // 9. Summary
        console.log('\n' + '='.repeat(60));
        console.log('📋 AUDIT SUMMARY');
        console.log('='.repeat(60));
        console.log(`Total products: ${allProducts.length}`);
        console.log(`Products with category: ${allProducts.filter(p => p.categoryId).length}`);
        console.log(`Products without category: ${productsWithoutCategory.length - categorized}`);
        console.log(`Auto-categorized: ${categorized}`);
        console.log(`Products with promotions: ${promoProducts.length}`);
        console.log(`Promotion labels added: ${promoLabelsAdded}`);
        console.log(`New products (30 days): ${newProducts.length}`);
        console.log('='.repeat(60));

    } catch (error) {
        console.error('❌ Error during audit:', error);
    } finally {
        await prisma.$disconnect();
    }
}

auditAndFixProducts();
