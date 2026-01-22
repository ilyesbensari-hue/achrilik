const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listUsers() {
    try {
        const users = await prisma.user.findMany({
            take: 10,
            select: { email: true, name: true, role: true }
        });
        console.log('--- Utilisateurs ---');
        users.forEach(u => console.log(`${u.email} (${u.role}) - ${u.name}`));
        console.log('--------------------');
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

listUsers();
