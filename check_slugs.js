
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const categories = await prisma.category.findMany({
            select: { name: true, slug: true }
        });
        console.log("Existing Categories:", categories);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
