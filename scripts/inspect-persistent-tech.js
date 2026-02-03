
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const titles = [
        'Bracelet Connecté Sport',
        'Batterie Externe 10000mAh',
        'Câble Charge Rapide USB-C'
    ];

    const products = await prisma.product.findMany({
        where: {
            OR: titles.map(t => ({ title: { contains: t } }))
        },
        include: {
            Category: {
                include: {
                    Category: true
                }
            }
        }
    });

    console.log('Inspecting persisting tech products:');
    products.forEach(p => {
        console.log(`- Product: ${p.title} (${p.id})`);
        console.log(`  Category: ${p.Category?.name} (${p.Category?.slug}) [ID: ${p.Category?.id}]`);
        console.log(`  Parent: ${p.Category?.Category?.name}\n`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
