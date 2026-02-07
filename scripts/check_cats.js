// Check category IDs
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const categories = await prisma.category.findMany({
        where: {
            slug: {
                in: ['enfants', 'maroquinerie', 'accessoires', 'electronique']
            }
        },
        select: {
            id: true,
            name: true,
            slug: true
        }
    });

    console.log('Category IDs:');
    console.table(categories);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
