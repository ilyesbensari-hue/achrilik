
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Starting category cleanup...');

    // 1. Ensure "Vêtements" exists
    let vetements = await prisma.category.findFirst({ where: { slug: 'vetements' } });
    if (!vetements) {
        vetements = await prisma.category.create({
            data: { name: 'Vêtements', slug: 'vetements', parentId: null }
        });
        console.log('Created Vêtements category');
    } else {
        // Ensure it's a root category
        if (vetements.parentId) {
            await prisma.category.update({ where: { id: vetements.id }, data: { parentId: null } });
            console.log('Fixed Vêtements to be root');
        }
    }

    // 2. Define desired subcategories under Vêtements
    const subs = [
        { name: 'Homme', slug: 'homme', aliases: ['hommes', 'vêtements homme', 'vetements homme'] },
        { name: 'Femme', slug: 'femme', aliases: ['femmes', 'vêtements femme', 'vetements femme'] },
        { name: 'Enfants', slug: 'enfants', aliases: ['enfant', 'vêtements enfants', 'vetements enfants'] },
        { name: 'Bébé', slug: 'bebe', aliases: ['bebes', 'vêtements bébé', 'vetements bebe'] }
    ];

    for (const sub of subs) {
        // Find the main subcategory if it exists
        let mainSub = await prisma.category.findFirst({
            where: {
                slug: sub.slug,
                parentId: vetements.id
            }
        });

        // If not strictly found as a child of Vetements, look for it globally
        if (!mainSub) {
            mainSub = await prisma.category.findFirst({ where: { slug: sub.slug } });

            if (mainSub) {
                // Move it under Vetements
                await prisma.category.update({
                    where: { id: mainSub.id },
                    data: { parentId: vetements.id, name: sub.name }
                });
                console.log(`Moved ${sub.name} under Vêtements`);
            } else {
                // Create it
                mainSub = await prisma.category.create({
                    data: { name: sub.name, slug: sub.slug, parentId: vetements.id }
                });
                console.log(`Created ${sub.name} under Vêtements`);
            }
        }

        // 3. Find duplicates (aliases) and merge them
        // We look for categories that match aliases OR name matches
        const duplicates = await prisma.category.findMany({
            where: {
                OR: [
                    { slug: { in: sub.aliases } },
                    { name: { in: sub.aliases.concat(sub.name) } } // Also match exact name if it's a duplicate entry distinct from mainSub
                ],
                id: { not: mainSub.id } // Exclude the valid one
            },
            include: { Product: true }
        });

        for (const dup of duplicates) {
            console.log(`Merging duplicate ${dup.name} (${dup.id}) into ${mainSub.name}...`);

            // Move products
            if (dup.Product.length > 0) {
                await prisma.product.updateMany({
                    where: { categoryId: dup.id },
                    data: { categoryId: mainSub.id }
                });
                console.log(`  Moved ${dup.Product.length} products.`);
            }

            // Move subcategories
            await prisma.category.updateMany({
                where: { parentId: dup.id },
                data: { parentId: mainSub.id }
            });

            // Delete duplicate
            await prisma.category.delete({ where: { id: dup.id } });
            console.log(`  Deleted duplicate ${dup.name}.`);
        }
    }

    // 4. Final Cleanup: Remove any other "Vêtements *" top-level categories that might have been missed by strict alias matching
    // but are clearly duplicates (e.g. typos or slight variations not in my list)
    // Be careful not to delete legitimate other categories.
    // Strategy: Find top-level categories starting with "Vêtement" that are NOT the main "Vêtements"
    const looseDuplicates = await prisma.category.findMany({
        where: {
            name: { startsWith: 'Vêtement' }, // Matches Vêtement...
            id: { not: vetements.id },
            parentId: null
        },
        include: { Product: true }
    });

    for (const dup of looseDuplicates) {
        // Decide where to put them. If unsure, put them in Vêtements root for manual sorting, OR try to guess.
        console.log(`Found loose duplicate: ${dup.name}. Moving content to Vêtements root.`);

        if (dup.Product.length > 0) {
            await prisma.product.updateMany({
                where: { categoryId: dup.id },
                data: { categoryId: vetements.id }
            });
        }
        await prisma.category.updateMany({
            where: { parentId: dup.id },
            data: { parentId: vetements.id }
        });

        await prisma.category.delete({ where: { id: dup.id } });
    }


    console.log('Cleanup complete.');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
