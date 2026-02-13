import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function resetDemoPassword() {
    try {
        console.log('🔍 Recherche du compte demo@achrilik.com...');

        // Find the user
        const user = await prisma.user.findUnique({
            where: { email: 'demo@achrilik.com' },
            include: {
                Store: true
            }
        });

        if (!user) {
            console.error('❌ Utilisateur demo@achrilik.com introuvable!');
            return;
        }

        console.log('✅ Utilisateur trouvé:');
        console.log(`   - ID: ${user.id}`);
        console.log(`   - Nom: ${user.name}`);
        console.log(`   - Email: ${user.email}`);
        console.log(`   - Role: ${user.role}`);
        if (user.Store) {
            console.log(`   - Magasin: ${user.Store.name} (ID: ${user.Store.id})`);
        }

        // Reset password to demo123
        const newPassword = 'demo123';
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        console.log('\n🔧 Mise à jour du mot de passe...');

        await prisma.user.update({
            where: { email: 'demo@achrilik.com' },
            data: {
                password: hashedPassword
            }
        });

        console.log('✅ Mot de passe mis à jour avec succès!');
        console.log('\n📋 Informations de connexion:');
        console.log('   Email: demo@achrilik.com');
        console.log('   Mot de passe: demo123');
        console.log('\n✅ Vous pouvez maintenant vous connecter avec ces identifiants.');

    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await prisma.$disconnect();
    }
}

resetDemoPassword();
