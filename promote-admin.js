const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function promoteToAdmin(email) {
    if (!email) {
        console.error('❌ Usage: node promote-admin.js <email>');
        process.exit(1);
    }

    try {
        console.log(`🔍 Recherche de l'utilisateur: ${email}...`);

        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            console.error('❌ Utilisateur non trouvé !');
            console.log('💡 Conseil: Assurez-vous que l\'utilisateur s\'est déjà inscrit sur le site.');
            process.exit(1);
        }

        console.log(`👤 Utilisateur trouvé: ${user.name} (${user.role})`);

        if (user.role === 'ADMIN') {
            console.log('✅ Cet utilisateur est DÉJÀ admin.');
            return;
        }

        const updatedUser = await prisma.user.update({
            where: { email },
            data: { role: 'ADMIN' }
        });

        console.log('🎉 SUCCÈS !');
        console.log(`✅ L'utilisateur ${updatedUser.email} est maintenant ADMIN.`);
        console.log('👉 Vous pouvez vous connecter au Dashboard: /admin');

    } catch (error) {
        console.error('❌ Erreur lors de la promotion:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Récupérer l'email depuis les arguments
const emailArg = process.argv[2];
promoteToAdmin(emailArg);
