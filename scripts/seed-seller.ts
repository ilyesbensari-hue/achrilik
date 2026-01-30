
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const email = 'verified-seller@test.com';
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);

    // Upsert User
    const user = await prisma.user.upsert({
        where: { email },
        update: {
            password: hashedPassword,
            roles: ['BUYER', 'SELLER'], // Ensure SELLER role
            role: 'SELLER' // details
        },
        create: {
            email,
            password: hashedPassword,
            name: 'Verified Seller',
            roles: ['BUYER', 'SELLER'],
            role: 'SELLER'
        }
    });

    console.log(`User ensured: ${user.id}`);

    // Upsert Store
    const store = await prisma.store.upsert({
        where: { ownerId: user.id },
        update: {
            verified: true,
            name: 'Seller Start Store'
        },
        create: {
            name: 'Seller Start Store',
            description: 'Test Store for redirection',
            city: 'Oran',
            address: '123 Test St',
            phone: '0550000000',
            ownerId: user.id,
            verified: true
        }
    });

    console.log(`Store ensured: ${store.id}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
