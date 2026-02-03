import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOptionalAuth } from '@/lib/server-auth';
import { randomBytes } from 'crypto';

/**
 * POST /api/client/save-info
 * Sauvegarder les informations client en base de données
 */
export async function POST(request: NextRequest) {
    try {
        const authUser = await getOptionalAuth();
        const data = await request.json();

        const { email, telephone, prenom, nom, adresses, preferences } = data;

        if (!email) {
            return NextResponse.json(
                { error: 'Email requis' },
                { status: 400 }
            );
        }

        // Créer ou mettre à jour le client (upsert)
        const savedUser = await prisma.user.upsert({
            where: { email },
            create: {
                id: randomBytes(16).toString('hex'),
                email,
                password: randomBytes(32).toString('hex'), // Temporary password
                name: prenom && nom ? `${prenom} ${nom}` : email.split('@')[0],
            },
            update: {
                name: prenom && nom ? `${prenom} ${nom}` : undefined,
            }
        });

        // TODO: Sauvegarder adresses si table Address existe
        // if (adresses && adresses.length > 0) {
        //   await prisma.address.createMany({
        //     data: adresses.map(addr => ({
        //       ...addr,
        //       userId: user.id
        //     }))
        //   });
        // }

        return NextResponse.json({
            success: true,
            message: 'Informations sauvegardées',
            userId: savedUser.id,
            client: {
                email: savedUser.email,
                prenom: prenom || '',
                nom: nom || '',
                telephone: telephone || ''
            }
        });

    } catch (error) {
        console.error('Error saving client info:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la sauvegarde' },
            { status: 500 }
        );
    }
}
