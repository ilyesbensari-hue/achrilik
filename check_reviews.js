
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkReviews() {
    const productsWithReviews = await prisma.product.findMany({
        where: {
            reviews: {
                some: {}
            }
        },
        include: {
            reviews: true
        }
    });

    console.log('Products with reviews:', JSON.stringify(productsWithReviews, null, 2));

    const allReviews = await prisma.review.findMany();
    console.log('Total reviews in DB:', allReviews.length);
}

checkReviews()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
