const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function findVendors() {
    try {
        console.log('🔍 Searching for vendor users...\n');

        const sellers = await prisma.user.findMany({
            where: {
                roles: {
                    has: 'SELLER'
                }
            },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                Store: {
                    select: {
                        id: true,
                        name: true,
                        verified: true,
                        _count: {
                            select: {
                                Product: true
                            }
                        }
                    }
                }
            }
        });

        console.log(`Found ${sellers.length} vendor users:\n`);

        sellers.forEach((seller, index) => {
            console.log(`${index + 1}. ${seller.name || 'Unnamed'}`);
            console.log(`   Email: ${seller.email}`);
            console.log(`   ID: ${seller.id}`);
            console.log(`   Store: ${seller.Store?.name || 'No store'}`);
            console.log(`   Verified: ${seller.Store?.verified || false}`);
            console.log(`   Products: ${seller.Store?._count?.Product || 0}`);
            console.log(`   Created: ${seller.createdAt.toLocaleDateString()}`);
            console.log('');
        });

        if (sellers.length === 0) {
            console.log('⚠️  No vendor users found in database!');
        } else {
            console.log('\n💡 To test product modification, you can log in with any of these vendor emails.');
            console.log('   If you don\'t know the password, you may need to reset it or create a test account.\n');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

findVendors();
