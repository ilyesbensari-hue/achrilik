import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth-token';

// GET - Load current delivery settings
export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token');

        if (!token?.value) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        // Verify JWT and extract user email
        const payload = await verifyToken(token.value);
        if (!payload || !payload.email) {
            return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
        }

        // Find user and store
        const user = await prisma.user.findUnique({
            where: { email: payload.email as string },
            include: {
                Store: {
                    select: {
                        id: true,
                        offersFreeDelivery: true,
                        freeDeliveryThreshold: true,
                    }
                }
            }
        });

        if (!user?.Store) {
            return NextResponse.json({ error: 'Boutique non trouvée' }, { status: 404 });
        }

        return NextResponse.json({
            offersFreeDelivery: user.Store.offersFreeDelivery || false,
            freeDeliveryThreshold: user.Store.freeDeliveryThreshold || 8000,
        });

    } catch (error) {
        console.error('Error loading delivery settings:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}

// POST - Update delivery settings
export async function POST(request: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token');

        if (!token?.value) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        // Verify JWT and extract user email
        const payload = await verifyToken(token.value);
        if (!payload || !payload.email) {
            return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
        }

        // Find user and store
        const user = await prisma.user.findUnique({
            where: { email: payload.email as string },
            include: { Store: true }
        });

        if (!user?.Store) {
            return NextResponse.json({ error: 'Boutique non trouvée' }, { status: 404 });
        }

        const body = await request.json();
        const { offersFreeDelivery, freeDeliveryThreshold } = body;

        // Validation
        if (offersFreeDelivery) {
            if (!freeDeliveryThreshold || freeDeliveryThreshold < 1000 || freeDeliveryThreshold > 50000) {
                return NextResponse.json(
                    { error: 'Le seuil doit être entre 1 000 DA et 50 000 DA' },
                    { status: 400 }
                );
            }
        }

        // Update store settings
        await prisma.store.update({
            where: { id: user.Store.id },
            data: {
                offersFreeDelivery: offersFreeDelivery,
                freeDeliveryThreshold: offersFreeDelivery ? freeDeliveryThreshold : null,
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Paramètres enregistrés avec succès'
        });

    } catch (error) {
        console.error('Error updating delivery settings:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
