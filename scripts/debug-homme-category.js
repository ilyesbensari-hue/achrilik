
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // Find "Homme" category
    const homme = await prisma.category.findFirst({
        where: {
            OR: [
                { name: { equals: 'Homme', mode: 'insensitive' } },
                { slug: { equals: 'homme', mode: 'insensitive' } }
            ]
        }
    });

    if (!homme) {
        console.log('Category Homme not found');
        return;
    }

    console.log(`Found Homme: ${homme.name} (${homme.id})`);

    // Get children
    const children = await prisma.category.findMany({
        where: { parentId: homme.id },
        include: {
            Product: {
                select: { title: true, id: true },
                take: 3
            }
        }
    });

    console.log(`Found ${children.length} children for Homme:`);
    children.forEach(child => {
        console.log(`- ${child.name} (${child.slug})`);
        if (child.Product.length > 0) {
            console.log(`  Wrapper products: ${child.Product.map(p => p.title).join(', ')}`);
        }
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
