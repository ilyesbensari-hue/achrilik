
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany({
        where: {
            role: 'SELLER'
        },
        include: {
            store: true
        }
    });
    console.table(users.map(u => ({
        id: u.id,
        email: u.email,
        name: u.name,
        storeId: u.store?.id,
        storeName: u.store?.name
    })));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
