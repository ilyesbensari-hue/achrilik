import { PrismaClient } from '@prisma/client';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Configuration du prestataire de livraison...\n');

    // 1. Trouver l'utilisateur livreur@achrilik.com
    const email = 'livreur@achrilik.com';
    let user = await prisma.user.findUnique({
        where: { email },
        include: { DeliveryAgent: true }
    });

    if (!user) {
        console.log(`❌ Utilisateur ${email} n'existe pas.`);
        console.log('Veuillez d\'abord créer le compte via /register\n');
        return;
    }

    console.log(`✅ Utilisateur trouvé: ${user.name} (${user.email})`);
    console.log(`   Rôle actuel: ${user.role}\n`);

    // 2. Vérifier si DeliveryAgent existe déjà
    if (user.DeliveryAgent) {
        console.log(`✅ DeliveryAgent existe déjà!`);
        console.log(`   ID: ${user.DeliveryAgent.id}`);
        console.log(`   Wilaya: ${user.DeliveryAgent.wilaya}`);
        console.log(`   Actif: ${user.DeliveryAgent.isActive ? '✅ Oui' : '❌ Non'}\n`);

        // Activer si inactif
        if (!user.DeliveryAgent.isActive) {
            await prisma.deliveryAgent.update({
                where: { id: user.DeliveryAgent.id },
                data: { isActive: true }
            });
            console.log('✅ DeliveryAgent activé!\n');
        }
    } else {
        console.log('📝 Création du profil DeliveryAgent...\n');

        // Créer DeliveryAgent
        const deliveryAgent = await prisma.deliveryAgent.create({
            data: {
                id: randomBytes(12).toString('hex'),
                userId: user.id,
                wilaya: 'Oran',
                isActive: true
            }
        });

        console.log(`✅ DeliveryAgent créé!`);
        console.log(`   ID: ${deliveryAgent.id}`);
        console.log(`   Wilaya: ${deliveryAgent.wilaya}\n`);
    }

    // 3. Mettre à jour le rôle de l'utilisateur si nécessaire
    const roles = Array.isArray(user.roles) ? user.roles :
        typeof user.roles === 'string' ? user.roles.split(',') :
            [user.role];

    if (!roles.includes('DELIVERY_AGENT') && user.role !== 'DELIVERY_AGENT') {
        console.log('📝 Ajout du rôle DELIVERY_AGENT...\n');

        const updatedRoles = [...new Set([...roles, 'DELIVERY_AGENT'])];

        await prisma.user.update({
            where: { id: user.id },
            data: {
                role: 'DELIVERY_AGENT',
                roles: updatedRoles
            }
        });

        console.log(`✅ Rôle DELIVERY_AGENT ajouté!`);
        console.log(`   Rôles: ${updatedRoles.join(', ')}\n`);
    } else {
        console.log(`✅ Rôle DELIVERY_AGENT déjà présent\n`);
    }

    // 4. Résumé final
    const finalUser = await prisma.user.findUnique({
        where: { email },
        include: { DeliveryAgent: true }
    });

    console.log('═══════════════════════════════════════════');
    console.log('✅ CONFIGURATION TERMINÉE!');
    console.log('═══════════════════════════════════════════\n');
    console.log(`👤 Utilisateur: ${finalUser!.name}`);
    console.log(`📧 Email: ${finalUser!.email}`);
    console.log(`🎭 Rôle: ${finalUser!.role}`);
    console.log(`🚚 DeliveryAgent ID: ${finalUser!.DeliveryAgent?.id}`);
    console.log(`📍 Wilaya: ${finalUser!.DeliveryAgent?.wilaya}`);
    console.log(`✅ Actif: ${finalUser!.DeliveryAgent?.isActive ? 'Oui' : 'Non'}\n`);
    console.log('🔗 URL de connexion: https://achrilik.com/login');
    console.log('🎯 Dashboard: https://achrilik.com/livreur\n');
}

main()
    .catch((e) => {
        console.error('❌ Erreur:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
