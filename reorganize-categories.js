
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Starting category reorganization...');

    // 1. Find or Create "Vêtements" top-level category
    let vetements = await prisma.category.findFirst({ where: { slug: 'vetements' } });
    // Actually wait, let's just use regular findFirst
    vetements = await prisma.category.findFirst({ where: { slug: 'vetements' } });

    if (!vetements) {
        console.log('Creating Vêtements category...');
        vetements = await prisma.category.create({
            data: {
                id: 'cat_vetements_root',
                name: 'Vêtements',
                slug: 'vetements',
                parentId: null
            }
        });
    } else {
        console.log('Vêtements category already exists.');
    }

    // 2. Update Homme
    const homme = await prisma.category.findFirst({
        where: {
            OR: [{ slug: 'hommes' }, { slug: 'homme' }, { name: 'Vêtements Homme' }]
        }
    });
    if (homme) {
        console.log('Updating Homme...');
        await prisma.category.update({
            where: { id: homme.id },
            data: {
                name: 'Homme',
                slug: 'homme', // Ensure singular consistency if wanted, or keep established slug
                parentId: vetements.id
            }
        });
    } else {
        console.log('Creating Homme...');
        await prisma.category.create({
            data: {
                name: 'Homme',
                slug: 'homme',
                parentId: vetements.id
            }
        });
    }

    // 3. Update Femme
    const femme = await prisma.category.findFirst({
        where: {
            OR: [{ slug: 'femmes' }, { slug: 'femme' }, { name: 'Vêtements Femme' }]
        }
    });
    if (femme) {
        console.log('Updating Femme...');
        await prisma.category.update({
            where: { id: femme.id },
            data: {
                name: 'Femme',
                slug: 'femme',
                parentId: vetements.id
            }
        });
    } else {
        console.log('Creating Femme...');
        await prisma.category.create({
            data: {
                name: 'Femme',
                slug: 'femme',
                parentId: vetements.id
            }
        });
    }

    // 4. Update Enfants
    const enfants = await prisma.category.findFirst({
        where: {
            OR: [{ slug: 'enfants' }, { name: 'Vêtements Enfants' }]
        }
    });
    if (enfants) {
        console.log('Updating Enfants...');
        await prisma.category.update({
            where: { id: enfants.id },
            data: {
                name: 'Enfants',
                slug: 'enfants',
                parentId: vetements.id
            }
        });
    } else {
        console.log('Creating Enfants...');
        await prisma.category.create({
            data: {
                name: 'Enfants',
                slug: 'enfants',
                parentId: vetements.id
            }
        });
    }

    console.log('Reorganization complete.');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
