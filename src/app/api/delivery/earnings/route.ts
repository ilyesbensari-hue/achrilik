import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth-token';

/**
 * GET /api/delivery/earnings
 * Get earnings data for the delivery agent
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

        // Get all delivered orders
        const deliveredOrders = await prisma.delivery.findMany({
            where: {
                agentId: agent.id,
                status: 'DELIVERED'
            },
            select: {
                codAmount: true,
                codCollected: true,
                updatedAt: true
            }
        });

        // Calculate total earnings (COD collected)
        const totalEarnings = deliveredOrders.filter(d => d.codCollected).reduce((sum, d) => sum + (d.codAmount || 0), 0);
        const pendingCOD = deliveredOrders.filter(d => !d.codCollected).reduce((sum, d) => sum + (d.codAmount || 0), 0);
        const deliveryCount = deliveredOrders.length;

        // Calculate this month and last month
        const now = new Date();
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

        const thisMonthDeliveries = deliveredOrders.filter(d =>
            new Date(d.updatedAt) >= thisMonthStart
        );
        const lastMonthDeliveries = deliveredOrders.filter(d =>
            new Date(d.updatedAt) >= lastMonthStart && new Date(d.updatedAt) <= lastMonthEnd
        );

        const thisMonth = thisMonthDeliveries.filter(d => d.codCollected).reduce((sum, d) => sum + (d.codAmount || 0), 0);
        const lastMonth = lastMonthDeliveries.filter(d => d.codCollected).reduce((sum, d) => sum + (d.codAmount || 0), 0);

        // For now, paidOut is 0 (would need a separate payment tracking system)
        const paidOut = 0;

        return NextResponse.json({
            earnings: {
                totalEarnings,
                pendingCOD,
                paidOut,
                thisMonth,
                lastMonth,
                deliveryCount
            }
        });

    } catch (error) {
        console.error('Error fetching earnings:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
