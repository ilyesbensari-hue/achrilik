const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdminAccount() {
    try {
        // Check if admin exists
        const existingAdmin = await prisma.user.findUnique({
            where: { email: 'admin@achrilik.com' }
        });

        if (existingAdmin) {
            console.log('✅ Admin account already exists');
            console.log('📧 Email:', existingAdmin.email);
            console.log('👤 Name:', existingAdmin.name);
            console.log('🔑 Roles:', existingAdmin.roles);

            // Update to ensure roles array is set
            if (!existingAdmin.roles || existingAdmin.roles.length === 0) {
                console.log('🔄 Updating roles array...');
                const hashedPassword = await bcrypt.hash('admin123', 10);

                await prisma.user.update({
                    where: { id: existingAdmin.id },
                    data: {
                        password: hashedPassword,
                        roles: ['ADMIN', 'BUYER']
                    }
                });
                console.log('✅ Roles updated successfully');
            }

            return;
        }

        // Create new admin account
        console.log('🔨 Creating admin account...');
        const hashedPassword = await bcrypt.hash('admin123', 10);

        const admin = await prisma.user.create({
            data: {
                email: 'admin@achrilik.com',
                name: 'Admin Achrilik',
                phone: '0770000000',
                password: hashedPassword,
                role: 'ADMIN', // Backward compatibility
                roles: ['ADMIN', 'BUYER'] // Multi-role
            }
        });

        console.log('✅ Admin account created successfully!');
        console.log('📧 Email: admin@achrilik.com');
        console.log('🔑 Password: admin123');
        console.log('👤 Name:', admin.name);
        console.log('🎯 Roles:', admin.roles);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createAdminAccount();
