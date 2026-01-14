
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const reviews = await prisma.review.findMany({
        include: {
            product: true
        }
    });

    console.log(`Found ${reviews.length} reviews.`);

    if (reviews.length > 0) {
        console.log('Sample review:', reviews[0]);
        console.log('Product ID for sample review:', reviews[0].productId);
    } else {
        console.log('No reviews found. Creating a test review...');

        // Get a product to review
        const product = await prisma.product.findFirst();
        if (!product) {
            console.log('No products found to review!');
            return;
        }

        // Get a user to be the reviewer
        const user = await prisma.user.findFirst();
        if (!user) {
            console.log('No users found to be the reviewer!');
            return;
        }

        const newReview = await prisma.review.create({
            data: {
                rating: 5,
                comment: 'Excellent product, highly recommended!',
                userId: user.id,
                productId: product.id
            }
        });
        console.log('Created test review:', newReview);
        console.log('For product:', product.title, '(ID:', product.id, ')');
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
