
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany({
        select: { email: true, role: true, name: true }
    });
    console.log("Users found:");
    users.forEach(u => console.log(`${u.role}: ${u.email} (${u.name})`));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
