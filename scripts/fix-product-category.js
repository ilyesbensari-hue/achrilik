
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const productTitle = 'Enceinte Bluetooth Portable';
    const newCategoryName = 'Audio';

    const product = await prisma.product.findFirst({
        where: { title: productTitle }
    });

    if (!product) {
        console.log('Product not found');
        return;
    }

    const category = await prisma.category.findFirst({
        where: { name: newCategoryName }
    });

    if (!category) {
        console.log('Category not found');
        return;
    }

    const updated = await prisma.product.update({
        where: { id: product.id },
        data: { categoryId: category.id }
    });

    console.log(`Updated product '${product.title}' to category '${category.name}'`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
