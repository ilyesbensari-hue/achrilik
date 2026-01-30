const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function test() {
    try {
        console.log('Testing Prisma Client...');

        // Test 1: Check if deliveryAgent table exists
        const count = await prisma.deliveryAgent.count();
        console.log(`✓ DeliveryAgent table exists. Count: ${count}`);

        // Test 2: Try to fetch delivery agents
        const agents = await prisma.deliveryAgent.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        roles: true
                    }
                },
                deliveries: {
                    select: {
                        id: true,
                        status: true,
                        codAmount: true,
                        codCollected: true
                    }
                }
            }
        });

        console.log(`✓ Successfully fetched ${agents.length} delivery agents`);

        if (agents.length > 0) {
            console.log('First agent:', JSON.stringify(agents[0], null, 2));
        }

        console.log('\n✓ All tests passed!');

    } catch (error) {
        console.error('✗ Error:', error.message);
        console.error('Stack:', error.stack);
    } finally {
        await prisma.$disconnect();
    }
}

test();
