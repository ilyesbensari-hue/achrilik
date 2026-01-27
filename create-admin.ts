import { PrismaClient } from '@prisma/client'
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

async function main() {
    console.log('👑 Creating Admin User...');

    const email = 'admin@achrilik.com';
    const password = 'admin123'; // In a real app, hash this!

    const admin = await prisma.user.upsert({
        where: { email },
        update: { role: 'ADMIN' },
        create: {
            id: randomBytes(16).toString('hex'),
            email,
            password,
            name: 'Super Admin',
            role: 'ADMIN',
            phone: '0000000000'
        },
    });

    console.log(`✅ Admin user ready: ${admin.email} / ${password}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
