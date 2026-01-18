import { prisma } from '../src/lib/prisma';
import { initializeEmailTemplates } from '../src/lib/email';

async function main() {
    console.log('🚀 Initializing email templates...');

    await initializeEmailTemplates();

    console.log('✅ Email templates initialized!');

    // Optional: Update existing products to have APPROVED status
    const productsWithoutStatus = await prisma.product.count({
        where: {
            status: 'PENDING'
        }
    });

    if (productsWithoutStatus > 0) {
        console.log(`📦 Found ${productsWithoutStatus} products with PENDING status`);
        console.log('ℹ️  You can approve them from /admin/products');
    }

    // Check for admin users
    const adminCount = await prisma.user.count({
        where: { role: 'ADMIN' }
    });

    if (adminCount === 0) {
        console.log('⚠️  No admin users found');
        console.log('ℹ️  Promote a user to ADMIN from /admin/users');
    } else {
        console.log(`✅ Found ${adminCount} admin user(s)`);
    }
}

main()
    .catch((e) => {
        console.error('❌ Error during initialization:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
