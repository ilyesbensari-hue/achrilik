// Script pour créer un compte administrateur
// Usage: ts-node scripts/create-admin.ts

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
    // Identifiants administrateur
    const email = 'ilyes213@hotmail.fr';
    const password = 'azertyui';
    const name = 'Administrateur';

    try {
        // Vérifier si l'email existe déjà
        const existing = await prisma.user.findUnique({
            where: { email }
        });

        if (existing) {
            console.log('❌ Un utilisateur avec cet email existe déjà!');
            console.log(`Email: ${existing.email}`);
            console.log(`Rôle actuel: ${existing.role}`);

            // Proposer de le mettre à jour en ADMIN
            if (existing.role !== 'ADMIN') {
                const updated = await prisma.user.update({
                    where: { id: existing.id },
                    data: { role: 'ADMIN' }
                });
                console.log('✅ Utilisateur mis à jour en ADMIN!');
            }
            return;
        }

        // Hasher le mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // Créer l'admin
        const admin = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role: 'ADMIN'
            }
        });

        console.log('✅ Compte administrateur créé avec succès!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`📧 Email: ${admin.email}`);
        console.log(`👤 Nom: ${admin.name}`);
        console.log(`🔑 Rôle: ${admin.role}`);
        console.log(`🆔 ID: ${admin.id}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('\nVous pouvez maintenant vous connecter avec ces identifiants.');
        console.log(`URL: https://www.achrilik.com/login`);
    } catch (error) {
        console.error('❌ Erreur lors de la création:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createAdmin();
