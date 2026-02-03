const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function ensureAdminExists() {
    console.log('🔍 Checking for admin account...');

    const adminEmail = 'ilyes.bensari@gmail.com';
    const adminPassword = 'azertyui';

    // Check if admin exists
    let admin = await prisma.user.findUnique({
        where: { email: adminEmail }
    });

    if (admin) {
        console.log('✅ Admin account exists:', admin.email);
        console.log('   ID:', admin.id);
        console.log('   Name:', admin.name);
        console.log('   Role:', admin.role);

        // Update password to ensure it's properly hashed
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        await prisma.user.update({
            where: { id: admin.id },
            data: {
                password: hashedPassword,
                role: 'ADMIN',
                roles: ['BUYER', 'SELLER', 'ADMIN', 'DELIVERY_AGENT']
            }
        });
        console.log('✅ Password updated and re-hashed');
        console.log('✅ All roles granted');
    } else {
        console.log('❌ Admin does not exist. Creating...');

        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        const crypto = require('crypto');
        const userId = crypto.randomBytes(12).toString('hex');

        admin = await prisma.user.create({
            data: {
                id: userId,
                email: adminEmail,
                password: hashedPassword,
                name: 'Ilyes Bensari',
                role: 'ADMIN',
                roles: ['BUYER', 'SELLER', 'ADMIN', 'DELIVERY_AGENT'],
                phone: '+213550000000'
            }
        });
        console.log('✅ Admin account created successfully!');
        console.log('   Email:', admin.email);
        console.log('   ID:', admin.id);
    }

    console.log('\n✅ Admin account is ready!');
    console.log('   Email: ilyes.bensari@gmail.com');
    console.log('   Password: azertyui');
    console.log('   Role: ADMIN (all roles)');
}

ensureAdminExists()
    .then(() => {
        console.log('\n✅ Done!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Error:', error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
