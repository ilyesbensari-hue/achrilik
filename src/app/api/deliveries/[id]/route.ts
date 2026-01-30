import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth-token';
import { cookies } from 'next/headers';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
        }

        const payload = await verifyToken(token);
        if (!payload || !payload.id) {
            return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
        }

        // Check if user is a delivery agent
        const deliveryAgent = await prisma.deliveryAgent.findUnique({
            where: { userId: payload.id as string }
        });

        if (!deliveryAgent) {
            return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
        }

        // Fetch delivery
        const delivery = await prisma.delivery.findUnique({
            where: { id },
            include: {
                order: {
                    select: {
                        id: true,
                        shippingName: true,
                        shippingPhone: true,
                        shippingAddress: true,
                        shippingWilaya: true,
                        total: true,
                        createdAt: true
                    }
                }
            }
        });

        if (!delivery || delivery.agentId !== deliveryAgent.id) {
            return NextResponse.json({ error: 'Livraison non trouvée' }, { status: 404 });
        }

        return NextResponse.json(delivery);

    } catch (error) {
        console.error('Error fetching delivery:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
