import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

// GET - Load current delivery settings
export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token');

        if (!token?.value) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        // Find user by auth token
        const authToken = await prisma.authToken.findUnique({
            where: {
                token: token.value
            },
            include: {
                user: {
                    include: {
                        Store: {
                            select: {
                                id: true,
                                offersFreeDelivery: true,
                                freeDeliveryThreshold: true,
                            }
                        }
                    }
                }
            }
        });

        if (!authToken || authToken.expiresAt < new Date()) {
            return NextResponse.json({ error: 'Token invalide ou expiré' }, { status: 401 });
        }

        if (!authToken.user.Store) {
            return NextResponse.json({ error: 'Boutique non trouvée' }, { status: 404 });
        }

        return NextResponse.json({
            offersFreeDelivery: authToken.user.Store.offersFreeDelivery || false,
            freeDeliveryThreshold: authToken.user.Store.freeDeliveryThreshold || 8000,
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

        // Find user by auth token
        const authToken = await prisma.authToken.findUnique({
            where: {
                token: token.value
            },
            include: {
                user: {
                    include: { Store: true }
                }
            }
        });

        if (!authToken || authToken.expiresAt < new Date()) {
            return NextResponse.json({ error: 'Token invalide ou expiré' }, { status: 401 });
        }

        if (!authToken.user.Store) {
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
            where: { id: authToken.user.Store.id },
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
