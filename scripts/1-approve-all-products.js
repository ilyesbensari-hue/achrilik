const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function approveAllProducts() {
    try {
        console.log('🔍 Checking products status...\n');

        // Get count by status
        const statusCounts = await prisma.product.groupBy({
            by: ['status'],
            _count: true
        });

        console.log('Current product status:');
        statusCounts.forEach(s => {
            console.log(`  ${s.status}: ${s._count} products`);
        });

        // Find all PENDING products
        const pendingProducts = await prisma.product.findMany({
            where: { status: 'PENDING' },
            select: {
                id: true,
                title: true,
                status: true,
                Category: {
                    select: { name: true }
                }
            }
        });

        if (pendingProducts.length === 0) {
            console.log('\n✅ No pending products to approve!');
            return;
        }

        console.log(`\n📋 Found ${pendingProducts.length} PENDING products:`);
        pendingProducts.slice(0, 10).forEach(p => {
            console.log(`  - ${p.title} (${p.Category?.name || 'No category'})`);
        });
        if (pendingProducts.length > 10) {
            console.log(`  ... and ${pendingProducts.length - 10} more`);
        }

        console.log('\n🔄 Approving all PENDING products...');

        // Update all PENDING to APPROVED
        const result = await prisma.product.updateMany({
            where: { status: 'PENDING' },
            data: { status: 'APPROVED' }
        });

        console.log(`\n✅ Successfully approved ${result.count} products!`);

        // Verify
        const newCounts = await prisma.product.groupBy({
            by: ['status'],
            _count: true
        });

        console.log('\nNew product status:');
        newCounts.forEach(s => {
            console.log(`  ${s.status}: ${s._count} products`);
        });

    } catch (error) {
        console.error('❌ Error approving products:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

approveAllProducts();
