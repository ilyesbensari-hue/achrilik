import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = 'test@achrilik.com';
    console.log(`Checking user: ${email}`);

    // Find user
    const user = await prisma.user.findUnique({
        where: { email },
        include: { Store: true }
    });

    if (!user) {
        console.error('User not found! Please ensure data is seeded or create the user manually.');
        process.exit(1);
    }

    console.log(`User found: ${user.id} (${user.name})`);

    // 1. Create Store if not exists
    if (user.Store) {
        console.log(`Store already exists: ${user.Store.name} (ID: ${user.Store.id})`);
    } else {
        console.log('Creating store for user...');
        const store = await prisma.store.create({
            data: {
                id: 'store_' + Math.random().toString(36).substring(2, 9),
                name: 'Boutique Test Force',
                description: 'Created via force-open-shop script',
                ownerId: user.id,
                city: 'Oran',
                address: 'Rue de la Liberté',
                phone: '0550123456',
                verified: true,
                hours: '09:00 - 18:00',
                clickCollect: true
            }
        });
        console.log(`Store created: ${store.name} (ID: ${store.id})`);
    }

    // 2. Update Roles
    console.log('Updating user roles...');

    // Handle current roles safety
    const currentRoles: Role[] = user.roles || [];
    let newRoles = [...currentRoles];

    if (!newRoles.includes(Role.SELLER)) {
        newRoles.push(Role.SELLER);
    }

    await prisma.user.update({
        where: { id: user.id },
        data: {
            role: 'SELLER', // Legacy support
            roles: newRoles
        }
    });

    console.log('User updated to SELLER role successfully.');
    console.log('Roles:', newRoles);
}

main()
    .catch((e) => {
        console.error('Error executing script:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
