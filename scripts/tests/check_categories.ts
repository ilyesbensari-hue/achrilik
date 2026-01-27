
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const categories = await prisma.category.findMany({
        include: {
            children: true,
            Category: true // parent
        }
    });

    const maroquinerie = categories.find(c => c.name === 'Maroquinerie');
    const sacs = categories.find(c => c.name === 'Sacs');

    console.log('--- CHECKING CATEGORIES ---');

    if (maroquinerie) {
        console.log(`Maroquinerie found (ID: ${maroquinerie.id})`);
        console.log('Children of Maroquinerie:', maroquinerie.children.map(c => c.name).join(', '));
    } else {
        console.log('Maroquinerie NOT found');
    }

    if (sacs) {
        console.log(`Sacs found (ID: ${sacs.id})`);
        if (sacs.parentId) {
            const parent = categories.find(c => c.id === sacs.parentId);
            console.log(`Sacs Parent: ${parent ? parent.name : sacs.parentId}`);
        } else {
            console.log('Sacs has NO parent (Top Level)');
        }
    } else {
        console.log('Sacs NOT found');
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
