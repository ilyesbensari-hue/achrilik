import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth-token';

/**
 * GET /api/delivery/history
 * Get delivery history for the delivery agent
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

        // Get filter from query params
        const { searchParams } = new URL(request.url);
        const filter = searchParams.get('filter') || 'all';

        // Get delivery agent
        const agent = await prisma.deliveryAgent.findFirst({
            where: { userId: payload.userId as string }
        });

        if (!agent) {
            return NextResponse.json({ error: 'Profil livreur introuvable' }, { status: 404 });
        }

        // Build where clause based on filter
        const whereClause: any = {
            agentId: agent.id
        };

        if (filter === 'delivered') {
            whereClause.status = 'DELIVERED';
        } else if (filter === 'failed') {
            whereClause.status = 'FAILED';
        } else {
            whereClause.status = {
                in: ['DELIVERED', 'FAILED', 'RETURNED']
            };
        }

        // Get delivery history
        const deliveries = await prisma.delivery.findMany({
            where: whereClause,
            include: {
                order: {
                    include: {
                        User: {
                            select: {
                                name: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                updatedAt: 'desc'
            },
            take: 50
        });

        const formattedDeliveries = deliveries.map(d => ({
            id: d.id,
            trackingNumber: d.trackingNumber,
            status: d.status,
            codAmount: d.codAmount,
            deliveredAt: d.updatedAt,
            customerName: d.order?.User?.name || 'Client'
        }));

        return NextResponse.json({ deliveries: formattedDeliveries });

    } catch (error) {
        console.error('Error fetching delivery history:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
