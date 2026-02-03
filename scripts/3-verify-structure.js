const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyStructure() {
    try {
        console.log('🔍 Verifying database structure...\n');

        // 1. Check product status distribution
        console.log('=== PRODUCT STATUS ===');
        const statusCounts = await prisma.product.groupBy({
            by: ['status'],
            _count: true
        });
        statusCounts.forEach(s => {
            console.log(`  ${s.status}: ${s._count} products`);
        });

        // 2. Check category structure
        console.log('\n=== CATEGORY STRUCTURE ===');
        const rootCategories = await prisma.category.findMany({
            where: { parentId: null },
            include: {
                children: {
                    include: {
                        children: {
                            select: {
                                name: true,
                                _count: { select: { products: true } }
                            }
                        },
                        _count: { select: { products: true } }
                    }
                },
                _count: { select: { products: true } }
            },
            orderBy: { order: 'asc' }
        });

        rootCategories.forEach(root => {
            console.log(`\n${root.name} (${root._count.products} direct products)`);
            root.children.forEach(child => {
                console.log(`  ├─ ${child.name} (${child._count.products} products)`);
                if (child.children.length > 0) {
                    child.children.forEach((grandchild, idx, arr) => {
                        const isLast = idx === arr.length - 1;
                        console.log(`  │  ${isLast ? '└─' : '├─'} ${grandchild.name} (${grandchild._count.products} products)`);
                    });
                }
            });
        });

        // 3. Check for products with promotions
        console.log('\n=== PROMOTIONS ===');
        const promoProducts = await prisma.product.findMany({
            where: {
                OR: [
                    { promotionLabel: { not: null } },
                    { discountPrice: { not: null } }
                ]
            },
            select: {
                title: true,
                promotionLabel: true,
                discountPrice: true,
                price: true
            }
        });

        if (promoProducts.length > 0) {
            console.log(`Found ${promoProducts.length} products with promotions:`);
            promoProducts.forEach(p => {
                console.log(`  - ${p.title}: ${p.promotionLabel || 'No label'} (${p.price} → ${p.discountPrice || 'N/A'})`);
            });
        } else {
            console.log('⚠️  No products with promotions found');
        }

        // 4. Check for "NEW" products
        console.log('\n=== NEW PRODUCTS ===');
        const newProducts = await prisma.product.findMany({
            where: { isNew: true },
            select: { title: true, createdAt: true }
        });

        if (newProducts.length > 0) {
            console.log(`Found ${newProducts.length} products marked as NEW:`);
            newProducts.slice(0, 5).forEach(p => {
                console.log(`  - ${p.title} (created: ${p.createdAt.toLocaleDateString()})`);
            });
        } else {
            console.log('⚠️  No products marked as NEW');
            console.log('   (Badge is calculated client-side based on createdAt)');
        }

        // 5. Check for robes
        console.log('\n=== ROBES CHECK ===');
        const robes = await prisma.product.findMany({
            where: {
                title: { contains: 'robe', mode: 'insensitive' }
            },
            select: {
                title: true,
                status: true,
                Category: { select: { name: true } }
            }
        });

        if (robes.length > 0) {
            console.log(`Found ${robes.length} robes:`);
            robes.forEach(r => {
                console.log(`  - ${r.title} [${r.status}] in ${r.Category?.name || 'No category'}`);
            });
        } else {
            console.log('⚠️  No robes found in database');
        }

        console.log('\n✅ Verification complete!');

    } catch (error) {
        console.error('❌ Error during verification:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

verifyStructure();
