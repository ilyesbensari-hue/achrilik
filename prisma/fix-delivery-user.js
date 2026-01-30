const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Vérification du compte livreur...\n');

    // Vérifier si l'utilisateur existe
    const existingUser = await prisma.user.findUnique({
        where: { email: 'livreur@achrilik.com' },
        include: {
            deliveryAgent: true
        }
    });

    if (existingUser) {
        console.log('✅ Utilisateur trouvé:');
        console.log('   ID:', existingUser.id);
        console.log('   Email:', existingUser.email);
        console.log('   Name:', existingUser.name);
        console.log('   Roles:', existingUser.roles);
        console.log('   DeliveryAgent:', existingUser.deliveryAgent ? 'Oui' : 'Non');

        // Mettre à jour le mot de passe pour être sûr
        const hashedPassword = await bcrypt.hash('livreur123', 10);
        await prisma.user.update({
            where: { id: existingUser.id },
            data: {
                password: hashedPassword,
                roles: ['DELIVERY_AGENT', 'BUYER']
            }
        });

        console.log('\n✅ Mot de passe mis à jour avec succès!');

        // Créer DeliveryAgent si manquant
        if (!existingUser.deliveryAgent) {
            await prisma.deliveryAgent.create({
                data: {
                    userId: existingUser.id,
                    vehicleType: 'MOTO',
                    licenseNumber: 'DZ-2024-12345',
                    isAvailable: true,
                    wilaya: 'Oran',
                }
            });
            console.log('✅ Profil DeliveryAgent créé!');
        }

    } else {
        console.log('❌ Utilisateur non trouvé. Création...');

        const hashedPassword = await bcrypt.hash('livreur123', 10);

        const newUser = await prisma.user.create({
            data: {
                email: 'livreur@achrilik.com',
                name: 'Karim Livreur',
                password: hashedPassword,
                phone: '0770123456',
                role: 'BUYER',
                roles: ['DELIVERY_AGENT', 'BUYER'],
                deliveryAgent: {
                    create: {
                        vehicleType: 'MOTO',
                        licenseNumber: 'DZ-2024-12345',
                        isAvailable: true,
                        wilaya: 'Oran',
                    }
                }
            }
        });

        console.log('✅ Utilisateur créé:', newUser.email);
    }

    console.log('\n📋 Compte prestataire:');
    console.log('   Email: livreur@achrilik.com');
    console.log('   Password: livreur123');
    console.log('   Dashboard: http://localhost:3000/delivery/dashboard');
}

main()
    .catch((e) => {
        console.error('❌ Erreur:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
