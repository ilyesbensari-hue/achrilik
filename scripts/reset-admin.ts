// Script to create/reset admin account for testing
import { prisma } from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

async function resetAdminAccount() {
    const email = 'admin@achrilik.com';
    const password = 'Admin123!'; // Strong password for admin
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        // Check if admin exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            // Update existing admin
            await prisma.user.update({
                where: { email },
                data: {
                    password: hashedPassword,
                    roles: ['ADMIN']
                }
            });
            console.log('✅ Admin account updated:', email);
        } else {
            // Create new admin
            await prisma.user.create({
                data: {
                    id: Math.random().toString(36).substring(7),
                    email,
                    password: hashedPassword,
                    name: 'Admin Achrilik',
                    roles: ['ADMIN']
                }
            });
            console.log('✅ Admin account created:', email);
        }

        console.log('📧 Email:', email);
        console.log('🔑 Password:', password);
        console.log('\n⚠️  Save these credentials!');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

resetAdminAccount();
