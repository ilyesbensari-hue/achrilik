import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth-token';

/**
 * PATCH /api/delivery/[id]/status
 * Update delivery status
 */
export async function PUT(
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

        const body = await request.json();
        const { status } = body;

        // Validate status
        const validStatuses = ['PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED'];
        if (!status || !validStatuses.includes(status)) {
            return NextResponse.json({ error: 'Statut invalide' }, { status: 400 });
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
            where: { id },
            include: {
                order: true
            }
        });

        if (!delivery) {
            return NextResponse.json({ error: 'Livraison introuvable' }, { status: 404 });
        }

        // Check if assigned to this agent
        if (delivery.agentId !== agent.id) {
            return NextResponse.json({
                error: 'Cette livraison n\'est pas assignée à vous'
            }, { status: 403 });
        }

        // Update delivery status
        const updatedDelivery = await prisma.delivery.update({
            where: { id },
            data: {
                status
            }
        });

        // If delivered, also update order status
        if (status === 'DELIVERED' && delivery.order) {
            await prisma.order.update({
                where: { id: delivery.orderId },
                data: {
                    status: 'DELIVERED'
                }
            });
        }

        return NextResponse.json({
            success: true,
            delivery: updatedDelivery
        });

    } catch (error) {
        console.error('Error updating delivery status:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
