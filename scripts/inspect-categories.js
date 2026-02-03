
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const rootParams = [
        { slug: { contains: 'vetement', mode: 'insensitive' } },
        { slug: { contains: 'mode', mode: 'insensitive' } }
    ];

    const clothingCategory = await prisma.category.findFirst({
        where: { OR: rootParams }
    });

    if (!clothingCategory) {
        console.log('No clothing category found');
        return;
    }

    console.log(`Found Clothing Root: ${clothingCategory.name} (${clothingCategory.id})`);

    const subcats = await prisma.category.findMany({
        where: { parentId: clothingCategory.id },
        include: {
            Product: { take: 1 },
            other_Category: { // Children
                include: {
                    Product: { take: 1 }
                }
            }
        }
    });

    for (const sub of subcats) {
        console.log(`\nSubcategory: ${sub.name} (${sub.id}) - Direct Products: ${sub.Product.length}`);
        if (sub.other_Category.length > 0) {
            console.log(`  Has ${sub.other_Category.length} children. Sample child: ${sub.other_Category[0].name} - Products: ${sub.other_Category[0].Product.length}`);
        } else {
            console.log('  No children (Leaf?)');
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
