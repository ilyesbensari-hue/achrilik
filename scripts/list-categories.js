
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function listCategories() {
    try {
        const categories = await prisma.category.findMany({
            where: {
                parentId: null, // Top level
            },
            orderBy: {
                name: 'asc',
            },
            include: {
                _count: {
                    select: { Product: true }
                }
            }
        });

        console.log('--- Top Level Categories ---');
        if (categories.length === 0) {
            console.log('No top level categories found.');
        }
        categories.forEach(c => {
            console.log(`- ${c.name} (Slug: ${c.slug}, ID: ${c.id})`);
        });
    } catch (error) {
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

listCategories();
