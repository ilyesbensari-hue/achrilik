import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/client/info?email=xxx
 * Charger les informations client depuis la base de données
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');

        if (!email) {
            return NextResponse.json(
                { error: 'Email requis' },
                { status: 400 }
            );
        }

        // Chercher l'utilisateur
        const user = await prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                name: true,
                // telephone: true, // Si champ existe
                // addresses: true, // Si relation existe
            }
        });

        if (!user) {
            return NextResponse.json(
                { error: 'Utilisateur non trouvé' },
                { status: 404 }
            );
        }

        // Formater la réponse
        const nameParts = user.name?.split(' ') || [];
        const response = {
            email: user.email,
            prenom: nameParts[0] || '',
            nom: nameParts.slice(1).join(' ') || '',
            // telephone: user.telephone,
            // adresses: user.addresses
        };

        return NextResponse.json(response);

    } catch (error) {
        console.error('Error loading client info:', error);
        return NextResponse.json(
            { error: 'Erreur lors du chargement' },
            { status: 500 }
        );
    }
}
