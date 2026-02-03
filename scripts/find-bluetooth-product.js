
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const products = await prisma.product.findMany({
        where: {
            title: { contains: 'Bluetooth', mode: 'insensitive' }
        },
        include: {
            Category: {
                include: {
                    Category: true // Parent category
                }
            }
        }
    });

    console.log('Found Bluetooth products:');
    products.forEach(p => {
        console.log(`- Product: ${p.title} (${p.id})`);
        console.log(`  Category: ${p.Category?.name} (${p.Category?.id})`);
        console.log(`  Parent Category: ${p.Category?.Category?.name} (${p.Category?.Category?.id})`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
