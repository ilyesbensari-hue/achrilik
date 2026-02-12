import { prisma } from './src/lib/prisma';

async function findAccounts() {
    // Find admin
    const admins = await prisma.user.findMany({
        where: { role: 'ADMIN' },
        select: { email: true, name: true }
    });

    // Find sellers with stores
    const sellers = await prisma.user.findMany({
        where: { role: 'SELLER' },
        include: { Store: true },
        take: 5
    });

    // Find buyers
    const buyers = await prisma.user.findMany({
        where: { role: 'BUYER' },
        select: { email: true, name: true },
        take: 5
    });

    console.log('=== ADMINS ===');
    admins.forEach(a => console.log(`${a.email} - ${a.name}`));

    console.log('\n=== SELLERS ===');
    sellers.forEach(s => console.log(`${s.email} - ${s.name} - Store: ${s.Store?.name || 'None'}`));

    console.log('\n=== BUYERS ===');
    buyers.forEach(b => console.log(`${b.email} - ${b.name}`));

    await prisma.$disconnect();
}

findAccounts();
