import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminApi } from '@/lib/server-auth';

/**
 * GET /api/admin/deliveries
 * List all deliveries with filters
 */
export async function GET(request: Request) {
    try {
        await requireAdminApi();

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
                        shippingWilaya: true,
                        deliveryLatitude: true,
                        deliveryLongitude: true
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
                deliveryLatitude: d.order.deliveryLatitude || null,
                deliveryLongitude: d.order.deliveryLongitude || null,
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
