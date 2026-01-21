const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function audit() {
    console.log("--- Starting Database Audit ---");

    try {
        // 1. Check Users
        const userCount = await prisma.user.count();
        console.log(`✅ Users in DB: ${userCount}`);

        const sellers = await prisma.user.count({ where: { role: 'SELLER' } });
        console.log(`ℹ️  Sellers: ${sellers}`);
        const admins = await prisma.user.count({ where: { role: 'ADMIN' } });
        console.log(`ℹ️  Admins: ${admins}`);

        // 2. Check Order Generation
        const orderCount = await prisma.order.count();
        console.log(`✅ Total Orders: ${orderCount}`);

        if (orderCount > 0) {
            const pendingOrders = await prisma.order.count({ where: { status: 'PENDING' } });
            console.log(`ℹ️  Pending Orders: ${pendingOrders}`);

            const confirmedOrders = await prisma.order.count({ where: { status: 'CONFIRMED' } });
            console.log(`ℹ️  Confirmed Orders: ${confirmedOrders}`);

            const deliveredOrders = await prisma.order.count({ where: { status: 'DELIVERED' } });
            console.log(`ℹ️  Delivered Orders: ${deliveredOrders}`);

            const cancelledOrders = await prisma.order.count({ where: { status: 'CANCELLED' } });
            console.log(`ℹ️  Cancelled Orders: ${cancelledOrders}`);
        } else {
            console.warn("⚠️  No orders found in the database. Has a test order been placed?");
        }

        // 3. Integrity Checks
        // Check for orders with no items (should not happen with transaction logic)
        const emptyOrders = await prisma.order.findMany({
            where: {
                items: {
                    none: {}
                }
            }
        });

        if (emptyOrders.length > 0) {
            console.error(`❌ Found ${emptyOrders.length} orders with NO items! IDs: ${emptyOrders.map(o => o.id).join(', ')}`);
        } else {
            console.log("✅ All orders have at least one item (Integrity OK).");
        }

        // Check for users without passwords (should not happen)
        const invalidUsers = await prisma.user.count({
            where: {
                password: {
                    equals: ""
                }
            }
        });
        if (invalidUsers > 0) console.error(`❌ Found ${invalidUsers} users with empty passwords.`);
        else console.log("✅ All users have passwords.");


    } catch (e) {
        console.error("Audit Failed:", e);
    } finally {
        await prisma.$disconnect();
    }
}

audit();
