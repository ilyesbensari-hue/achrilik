
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const email = 'future-seller@test.com';
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);

    // Clean up existing user if any
    await prisma.store.deleteMany({
        where: { owner: { email } }
    });

    await prisma.user.deleteMany({
        where: { email }
    });

    // Create fresh BUYER
    const user = await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            name: 'Future Seller',
            role: 'BUYER',
            roles: ['BUYER']
        }
    });

    console.log(`User created: ${user.id}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
