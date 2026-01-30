import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth-token';

/**
 * GET /api/delivery/active
 * Get active deliveries for the delivery agent
 */
export async function GET(request: Request) {
    try {
        const token = request.headers.get('cookie')?.split('auth_token=')[1]?.split(';')[0];
        if (!token) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        const payload = await verifyToken(token);
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

        // Get active deliveries for this agent
        const deliveries = await prisma.delivery.findMany({
            where: {
                agentId: agent.id,
                status: {
                    in: ['PENDING', 'ACCEPTED', 'READY_TO_SHIP', 'PICKED_UP', 'IN_TRANSIT']
                }
            },
            include: {
                order: {
                    include: {
                        User: {
                            select: {
                                name: true,
                                phone: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        const formattedDeliveries = deliveries.map(d => ({
            id: d.id,
            trackingNumber: d.trackingNumber,
            status: d.status,
            codAmount: d.codAmount,
            orderId: d.orderId,
            customerName: d.order?.User?.name || 'Client',
            customerPhone: d.order?.User?.phone || 'Non renseigné',
            shippingAddress: d.order?.shippingAddress || 'Non spécifié',
            acceptedAt: d.createdAt
        }));

        return NextResponse.json({ deliveries: formattedDeliveries });

    } catch (error) {
        console.error('Error fetching active deliveries:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
