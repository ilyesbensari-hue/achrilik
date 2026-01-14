
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- Stores ---');
    const stores = await prisma.store.findMany();
    console.table(stores.map(s => ({ id: s.id, name: s.name, ownerId: s.ownerId })));

    console.log('\n--- Orders ---');
    const orders = await prisma.order.findMany({
        include: {
            items: {
                include: {
                    variant: {
                        include: {
                            product: true
                        }
                    }
                }
            }
        }
    });

    if (orders.length === 0) {
        console.log('No orders found.');
    } else {
        orders.forEach(o => {
            console.log(`Order #${o.id.slice(0, 8)} - User: ${o.userId}`);
            o.items.forEach(i => {
                console.log(`  - Item: ${i.variant.product.title} (Store: ${i.variant.product.storeId})`);
            });
        });
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
