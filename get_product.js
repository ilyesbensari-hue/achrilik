
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getProduct() {
    const product = await prisma.product.findFirst();
    console.log('Product ID:', product.id);
    console.log('Product Name:', product.name);
}

getProduct()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
