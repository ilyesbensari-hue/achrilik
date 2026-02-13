import { PrismaClient } from '@prisma/client';
import { randomBytes } from 'crypto';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🔑 Creating/updating admin account...');

    // Generate a proper bcrypt hash for password "admin123"
    const hashedPassword = await bcrypt.hash('admin123', 10);
    console.log('   Generated password hash');

    const admin = await prisma.user.upsert({
        where: { email: 'admin@achrilik.com' },
        update: {
            password: hashedPassword,
            role: 'ADMIN',
            roles: ['ADMIN'],
            name: 'Admin Achrilik',
        },
        create: {
            id: randomBytes(16).toString('hex'),
            email: 'admin@achrilik.com',
            password: hashedPassword,
            name: 'Admin Achrilik',
            role: 'ADMIN',
            roles: ['ADMIN'],
        },
    });

    console.log('✅ Admin account ready:');
    console.log('   Email: admin@achrilik.com');
    console.log('   Password: admin123');
    console.log('   Role:', admin.role);
    console.log('   ID:', admin.id);
}

main()
    .catch((e) => {
        console.error('❌ Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
