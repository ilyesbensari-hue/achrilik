
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const techCats = await prisma.category.findMany({
        where: {
            OR: [
                { name: { contains: 'Tech', mode: 'insensitive' } },
                { slug: { contains: 'tech', mode: 'insensitive' } },
                { name: { contains: 'Audio', mode: 'insensitive' } },
                { slug: { contains: 'audio', mode: 'insensitive' } }
            ]
        }
    });

    console.log('Available Tech Categories:');
    techCats.forEach(c => console.log(`- ${c.name} (${c.id}) slug: ${c.slug}`));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
