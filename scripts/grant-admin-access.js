const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function grantAdminAccess() {
    console.log('=== ATTRIBUTION ACCÈS ADMIN ===\n');

    // Update admin@achrilik.com to ADMIN role
    const updated = await prisma.user.update({
        where: {
            email: 'admin@achrilik.com'
        },
        data: {
            role: 'ADMIN'
        }
    });

    console.log('✅ Utilisateur mis à jour:');
    console.log(`   Email: ${updated.email}`);
    console.log(`   Nom: ${updated.name}`);
    console.log(`   Rôle: ${updated.role}`);
    console.log(`   ID: ${updated.id}`);

    console.log('\n🔑 Vous pouvez maintenant vous connecter avec:');
    console.log('   Email: admin@achrilik.com');
    console.log('   Accès: /admin');

    await prisma.$disconnect();
}

grantAdminAccess()
    .then(() => {
        console.log('\n✅ Accès admin restauré avec succès');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Erreur:', error);
        process.exit(1);
    });
