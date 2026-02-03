
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // Find the Sac products
    const products = await prisma.product.findMany({
        where: {
            OR: [
                { title: { contains: 'Sac', mode: 'insensitive' } }
            ]
        },
        include: {
            Category: {
                include: {
                    Category: { // Parent
                        include: {
                            Category: true // Grandparent
                        }
                    }
                }
            }
        },
        take: 10
    });

    console.log('Found Sac products:');
    products.forEach(p => {
        const cat = p.Category;
        const parent = cat?.Category;
        const grandparent = parent?.Category;

        console.log(`\n- ${p.title} (${p.id})`);
        console.log(`  Category: ${cat?.name} (${cat?.id})`);
        console.log(`  Parent: ${parent?.name} (${parent?.id})`);
        console.log(`  Grandparent: ${grandparent?.name} (${grandparent?.id})`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
