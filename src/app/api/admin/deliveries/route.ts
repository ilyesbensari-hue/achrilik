import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth-token';

/**
 * GET /api/admin/deliveries
 * List all deliveries with filters
 */
export async function GET(request: Request) {
    try {
        // Verify admin
        const token = request.headers.get('cookie')?.split('auth_token=')[1]?.split(';')[0];
        if (!token) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        const payload = await verifyToken(token);
        if (!payload || !(payload.roles as string[])?.includes('ADMIN')) {
            return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
        }

        // Get query params
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const agentId = searchParams.get('agentId');
        const trackingNumber = searchParams.get('trackingNumber');

        // Build where clause
        const where: any = {};
        if (status) where.status = status;
        if (agentId) where.agentId = agentId;
        if (trackingNumber) where.trackingNumber = { contains: trackingNumber, mode: 'insensitive' };

        // Fetch deliveries
        const deliveries = await prisma.delivery.findMany({
            where,
            include: {
                agent: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                phone: true
                            }
                        }
                    }
                },
                order: {
                    select: {
                        id: true,
                        total: true,
                        shippingName: true,
                        shippingPhone: true,
                        shippingAddress: true,
                        shippingWilaya: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 100 // Limit for performance
        });

        // Calculate global stats
        const stats = {
            total: deliveries.length,
            pending: deliveries.filter(d => d.status === 'PENDING').length,
            inTransit: deliveries.filter(d => d.status === 'IN_TRANSIT').length,
            delivered: deliveries.filter(d => d.status === 'DELIVERED').length,
            failed: deliveries.filter(d => d.status === 'FAILED').length,
            totalCOD: deliveries
                .filter(d => d.status === 'DELIVERED' && d.codCollected)
                .reduce((sum, d) => sum + (d.codAmount || 0), 0)
        };

        return NextResponse.json({
            deliveries: deliveries.map(d => ({
                id: d.id,
                trackingNumber: d.trackingNumber,
                orderId: d.orderId,
                orderTotal: d.order.total,
                buyerName: d.order.shippingName,
                buyerPhone: d.order.shippingPhone,
                agentName: d.agent?.user.name || 'Non assigné',
                agentPhone: d.agent?.user.phone,
                status: d.status,
                shippingAddress: d.order.shippingAddress,
                wilaya: d.order.shippingWilaya,
                codAmount: d.codAmount,
                codCollected: d.codCollected,
                createdAt: d.createdAt,
                updatedAt: d.updatedAt
            })),
            stats
        });

    } catch (error) {
        console.error('Error fetching deliveries:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
