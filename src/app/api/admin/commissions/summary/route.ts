import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Dashboard commissions - Vue globale + par vendeur
export async function GET(request: NextRequest) {
    try {
        // Vérifier si user est admin (à implémenter)

        // 1. Récupérer toutes les commandes DELIVERED avec commission
        const deliveredOrders = await prisma.order.findMany({
            where: {
                status: 'DELIVERED',
                platformCommission: { not: null }
            },
            include: {
                Store: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        // 2. Calculer totaux globaux
        const totalCommissionDue = deliveredOrders.reduce(
            (sum, order) => sum + (order.platformCommission || 0),
            0
        );

        const totalCommissionPaid = deliveredOrders
            .filter(order => order.commissionPaid)
            .reduce((sum, order) => sum + (order.platformCommission || 0), 0);

        const totalCommissionUnpaid = totalCommissionDue - totalCommissionPaid;

        // 3. Grouper par vendeur
        const byStoreMap = new Map<string, {
            storeId: string;
            storeName: string;
            orderCount: number;
            totalSales: number;
            commissionDue: number;
            commissionPaid: number;
            commissionUnpaid: number;
        }>();

        deliveredOrders.forEach(order => {
            const storeId = order.storeId || 'unknown';
            const storeName = order.Store?.name || 'Unknown Store';

            if (!byStoreMap.has(storeId)) {
                byStoreMap.set(storeId, {
                    storeId,
                    storeName,
                    orderCount: 0,
                    totalSales: 0,
                    commissionDue: 0,
                    commissionPaid: 0,
                    commissionUnpaid: 0
                });
            }

            const storeData = byStoreMap.get(storeId)!;
            storeData.orderCount++;
            storeData.totalSales += order.total;
            storeData.commissionDue += order.platformCommission || 0;

            if (order.commissionPaid) {
                storeData.commissionPaid += order.platformCommission || 0;
            } else {
                storeData.commissionUnpaid += order.platformCommission || 0;
            }
        });

        const byStore = Array.from(byStoreMap.values());

        return NextResponse.json({
            success: true,
            summary: {
                totalCommissionDue,
                totalCommissionPaid,
                totalCommissionUnpaid,
                totalOrders: deliveredOrders.length,
                byStore
            }
        });
    } catch (error) {
        console.error('Error fetching commission summary:', error);
        return NextResponse.json(
            { error: 'Failed to fetch commission summary' },
            { status: 500 }
        );
    }
}
