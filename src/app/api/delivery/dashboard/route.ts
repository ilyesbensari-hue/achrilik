import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth-token';

/**
 * GET /api/delivery/dashboard
 * Get delivery agent dashboard stats and available deliveries
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

        // Get stats
        const [available, active, completed] = await Promise.all([
            // Available deliveries (pending or accepted)
            prisma.delivery.count({
                where: {
                    agentId: agent.id,
                    status: {
                        in: ['PENDING', 'ACCEPTED']
                    }
                }
            }),
            // Active deliveries
            prisma.delivery.count({
                where: {
                    agentId: agent.id,
                    status: {
                        in: ['READY_TO_SHIP', 'PICKED_UP', 'IN_TRANSIT']
                    }
                }
            }),
            // Completed deliveries
            prisma.delivery.count({
                where: {
                    agentId: agent.id,
                    status: 'DELIVERED'
                }
            })
        ]);

        // Calculate earnings (COD collected)
        const deliveredOrders = await prisma.delivery.findMany({
            where: {
                agentId: agent.id,
                status: 'DELIVERED'
            },
            select: {
                codAmount: true,
                codCollected: true
            }
        });

        const totalEarnings = deliveredOrders.filter(d => d.codCollected).reduce((sum, d) => sum + (d.codAmount || 0), 0);
        const pendingCOD = deliveredOrders.filter(d => !d.codCollected).reduce((sum, d) => sum + (d.codAmount || 0), 0);

        // Get available deliveries
        const availableDeliveries = await prisma.delivery.findMany({
            where: {
                agentId: agent.id,
                status: {
                    in: ['PENDING', 'ACCEPTED']
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
            },
            take: 10
        });

        const formattedDeliveries = availableDeliveries.map(d => ({
            id: d.id,
            trackingNumber: d.trackingNumber,
            status: d.status,
            codAmount: d.codAmount,
            orderId: d.orderId,
            customerName: d.order?.User?.name || 'Client',
            customerPhone: d.order?.User?.phone || 'Non renseigné',
            shippingAddress: d.order?.shippingAddress || 'Non spécifié',
            createdAt: d.createdAt
        }));

        return NextResponse.json({
            stats: {
                available,
                active,
                completed,
                totalEarnings,
                pendingCOD
            },
            availableDeliveries: formattedDeliveries
        });

    } catch (error) {
        console.error('Error fetching delivery dashboard:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
