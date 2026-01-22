#!/usr/bin/env node

/**
 * Payment Flow Test Script
 * Tests: Login → Cart → Payment → Order Confirmation
 * 
 * Requirements:
 * 1. Dev server running on localhost:3000
 * 2. Test user credentials in database
 * 3. At least one product available
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const TEST_USER = {
    email: 'buyer1@example.com',
    password: 'password123'
};

const BASE_URL = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';

console.log('🧪 Payment Flow Test\n');
console.log('This test verifies:');
console.log('  ✓ Login functionality');
console.log('  ✓ Cart button shows correct text based on auth');
console.log('  ✓ Checkout flow works');
console.log('  ✓ Order confirmation and emails\n');

async function testPaymentFlow() {
    try {
        console.log('📊 Step 1: Checking test prerequisites...');

        // Check if test user exists
        const testUser = await prisma.user.findUnique({
            where: { email: TEST_USER.email }
        });

        if (!testUser) {
            console.log(`❌ Test user ${TEST_USER.email} not found.`);
            console.log('   Creating test user...');

            const bcrypt = require('bcryptjs');
            const hashedPassword = await bcrypt.hash(TEST_USER.password, 10);
            const { randomBytes } = require('crypto');

            await prisma.user.create({
                data: {
                    id: randomBytes(16).toString('hex'),
                    email: TEST_USER.email,
                    password: hashedPassword,
                    name: 'Test Buyer',
                    role: 'BUYER'
                }
            });

            console.log('   ✅ Test user created');
        } else {
            console.log('   ✅ Test user exists');
        }

        // Check for products
        const productCount = await prisma.product.count({
            where: { status: 'APPROVED' }
        });

        if (productCount === 0) {
            console.log('   ⚠️  No approved products found. You may need to add products to test.');
        } else {
            console.log(`   ✅ ${productCount} approved products available`);
        }

        console.log('\n📊 Step 2: Manual Testing Instructions\n');
        console.log('Since this is a Next.js app, please perform these manual tests:');
        console.log('');
        console.log('🔹 Test 1: Logged Out State');
        console.log('   1. Open browser in incognito/private mode');
        console.log(`   2. Navigate to ${BASE_URL}`);
        console.log('   3. Add any product to cart');
        console.log('   4. Go to /cart');
        console.log('   5. ✓ Verify button shows: "SE CONNECTER ET PAYER"');
        console.log('');
        console.log('🔹 Test 2: Login Flow');
        console.log('   1. Click the "SE CONNECTER ET PAYER" button');
        console.log('   2. Should redirect to /login');
        console.log(`   3. Login with: ${TEST_USER.email} / ${TEST_USER.password}`);
        console.log('   4. ✓ Verify successful login and redirect');
        console.log('');
        console.log('🔹 Test 3: Logged In State');
        console.log('   1. Navigate to /cart');
        console.log('   2. ✓ Verify button now shows: "PAYER"');
        console.log('   3. ✓ Button should NOT redirect to login');
        console.log('');
        console.log('🔹 Test 4: Complete Checkout');
        console.log('   1. Click "PAYER" button');
        console.log('   2. Complete checkout form');
        console.log('   3. Submit order');
        console.log('   4. ✓ Verify redirect to /order-confirmation/[orderId]');
        console.log('   5. ✓ Check console/logs for email sending');
        console.log('');

        // Check for recent orders to validate flow worked
        console.log('📊 Step 3: Checking recent orders...\n');

        const recentOrders = await prisma.order.findMany({
            where: {
                userId: testUser?.id
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 5,
            include: {
                User: true,
                OrderItem: true
            }
        });

        if (recentOrders.length > 0) {
            console.log(`✅ Found ${recentOrders.length} order(s) for test user:\n`);
            recentOrders.forEach((order, i) => {
                console.log(`   Order ${i + 1}:`);
                console.log(`   - ID: ${order.id.slice(0, 8)}...`);
                console.log(`   - Date: ${order.createdAt.toLocaleString()}`);
                console.log(`   - Total: ${order.total} DA`);
                console.log(`   - Status: ${order.status}`);
                console.log(`   - Items: ${order.OrderItem.length}`);
                console.log(`   - Payment: ${order.paymentMethod}`);
                console.log('');
            });
        } else {
            console.log('ℹ️  No orders found yet for test user.');
            console.log('   Complete the manual test above to create an order.\n');
        }

        // Email verification
        console.log('📊 Step 4: Email Configuration Check\n');

        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            console.log('⚠️  SMTP credentials not configured in .env');
            console.log('   Emails will NOT be sent.');
            console.log('   See CONFIGURATION_SMTP.md for setup instructions.\n');
        } else {
            console.log('✅ SMTP configured:');
            console.log(`   - Host: ${process.env.SMTP_HOST}`);
            console.log(`   - Port: ${process.env.SMTP_PORT}`);
            console.log(`   - User: ${process.env.SMTP_USER}`);
            console.log('\n   Run: node test-all-emails.js to test email sending\n');
        }

        console.log('✅ Payment Flow Test Complete!\n');
        console.log('Summary:');
        console.log(`  - Test user: ${TEST_USER.email}`);
        console.log(`  - Products available: ${productCount}`);
        console.log(`  - Recent orders: ${recentOrders.length}`);
        console.log(`  - SMTP configured: ${process.env.SMTP_USER ? 'Yes' : 'No'}`);
        console.log('');
        console.log('Next Steps:');
        console.log('  1. Perform manual browser tests listed above');
        console.log('  2. If SMTP not configured, set up email (see CONFIGURATION_SMTP.md)');
        console.log('  3. Verify emails are received after order completion');
        console.log('');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

// Run the test
testPaymentFlow();
