
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listCategories() {
    try {
        const categories = await prisma.category.findMany({
            where: {
                parentId: null, // Top level categories
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
        categories.forEach(c => {
            console.log(`- ${c.name} (Slug: ${c.slug}, Products: ${c._count.Product})`);
        });
    } catch (error) {
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

listCategories();
