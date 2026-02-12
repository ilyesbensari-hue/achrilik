import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function checkAllAccounts() {
    console.log('\n=== VERIFICATION DES COMPTES ===\n');

    // 1. Admins
    const admins = await prisma.user.findMany({
        where: { role: 'ADMIN' },
        select: { id: true, email: true, name: true, role: true }
    });

    console.log('📋 ADMINS:');
    admins.forEach(a => console.log(`  - ${a.email} (${a.name})`));

    // 2. Sellers
    const sellers = await prisma.user.findMany({
        where: { role: 'SELLER' },
        include: { Store: { select: { name: true } } }
    });

    console.log('\n🏪 SELLERS:');
    sellers.forEach(s => console.log(`  - ${s.email} (${s.name}) - Store: ${s.Store?.name || 'Aucune'}`));

    // 3. Delivery Agents
    const agents = await prisma.user.findMany({
        where: { role: 'DELIVERY_AGENT' },
        select: { id: true, email: true, name: true }
    });

    console.log('\n🚚 DELIVERY AGENTS:');
    agents.forEach(a => console.log(`  - ${a.email} (${a.name})`));

    // 4. Buyers (quelques uns)
    const buyers = await prisma.user.findMany({
        where: { role: 'BUYER' },
        select: { id: true, email: true, name: true },
        take: 5
    });

    console.log('\n👥 BUYERS (premiers 5):');
    buyers.forEach(b => console.log(`  - ${b.email} (${b.name})`));

    // 5. Test password for livreur@achrilik.com
    console.log('\n🔐 TEST MOT DE PASSE livreur@achrilik.com:');
    const livreur = await prisma.user.findUnique({
        where: { email: 'livreur@achrilik.com' },
        select: { password: true }
    });

    if (livreur) {
        const isValid = await bcrypt.compare('livreur123', livreur.password);
        console.log(`  ✅ Password 'livreur123': ${isValid ? 'VALIDE' : 'INVALIDE'}`);
    }

    // 6. Test admin password
    console.log('\n🔐 TEST MOT DE PASSE ilyes.bensari@achrilik.com:');
    const admin = await prisma.user.findUnique({
        where: { email: 'ilyes.bensari@achrilik.com' },
        select: { password: true }
    });

    if (admin) {
        const testPasswords = ['password123', 'admin123', 'achrilik123', 'ilyes123'];
        for (const pwd of testPasswords) {
            const isValid = await bcrypt.compare(pwd, admin.password);
            if (isValid) {
                console.log(`  ✅ Password '${pwd}': VALIDE`);
                break;
            } else {
                console.log(`  ❌ Password '${pwd}': INVALIDE`);
            }
        }
    } else {
        console.log('  ⚠️  Compte introuvable');
    }

    await prisma.$disconnect();
}

checkAllAccounts().catch(console.error);
