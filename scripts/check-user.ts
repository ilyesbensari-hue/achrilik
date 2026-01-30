
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = 'demo@achrilik.com';
    const user = await prisma.user.findUnique({
        where: { email },
        include: { Store: true }
    });

    if (!user) {
        console.log(`User ${email} not found.`);
        // Create demo user if not exists
        /*
        const hashedPassword = await bcrypt.hash('demo123', 10);
        const newUser = await prisma.user.create({
          data: {
            email,
            password: hashedPassword,
            name: 'Demo User',
            roles: ['BUYER', 'SELLER'],
            activeRole: 'BUYER' // This field might not exist on DB model if it's computed? 
                                // actually activeRole is not in DB model User based on schema.prisma I saw earlier! 
                                // It's part of the JWT/Session.
          }
        });
        console.log('Created demo user:', newUser);
        */
    } else {
        console.log('Found user:', JSON.stringify(user, null, 2));
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
