import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth-token';
import { NextRequest } from 'next/server'; // Added NextRequest import

/**
 * POST /api/delivery/[id]/accept
 * Accept a delivery
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const token = request.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = await verifyToken(token);
        const userId = payload?.userId;
        const deliveryId = id;
        if (!payload || !(payload.roles as string[])?.includes('DELIVERY_AGENT')) {
            return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
        }

        // Get delivery agent
        const agent = await prisma.deliveryAgent.findFirst({
            where: { userId: payload.userId as string }
        });

        if (!agent) {
            return NextResponse.json({ error: 'Profil livreur introuvable' }, { status: 404 });
        }

        // Get delivery
        const delivery = await prisma.delivery.findUnique({
            where: { id }
        });

        if (!delivery) {
            return NextResponse.json({ error: 'Livraison introuvable' }, { status: 404 });
        }

        // Check if already assigned to this agent
        if (delivery.agentId !== agent.id) {
            return NextResponse.json({
                error: 'Cette livraison n\'est pas assignée à vous'
            }, { status: 403 });
        }

        // Check if already accepted
        if (delivery.status !== 'PENDING') {
            return NextResponse.json({
                error: 'Cette livraison a déjà été acceptée'
            }, { status: 400 });
        }

        // Update status to ACCEPTED
        const updatedDelivery = await prisma.delivery.update({
            where: { id },
            data: {
                status: 'ACCEPTED'
            }
        });

        return NextResponse.json({
            success: true,
            delivery: updatedDelivery
        });

    } catch (error) {
        console.error('Error accepting delivery:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
