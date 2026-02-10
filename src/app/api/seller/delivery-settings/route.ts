import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET - Load current delivery settings
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
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
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
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

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { Store: true }
        });

        if (!user?.Store) {
            return NextResponse.json({ error: 'Boutique non trouvée' }, { status: 404 });
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
