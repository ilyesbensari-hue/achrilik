
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const categories = await prisma.category.findMany({
        orderBy: { name: 'asc' }
    });

    console.log('All Categories:');
    categories.forEach(c => console.log(`- ${c.name} (${c.slug}) [ID: ${c.id}]`));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
