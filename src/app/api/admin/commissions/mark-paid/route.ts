import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST: Marquer commissions comme payées pour un vendeur
export async function POST(request: NextRequest) {
    try {
        // Vérifier si user est admin

        const body = await request.json();
        const { storeId, paymentNote } = body;

        if (!storeId) {
            return NextResponse.json(
                { error: 'Store ID required' },
                { status: 400 }
            );
        }

        // Mettre à jour toutes les commandes impayées de ce vendeur
        const result = await prisma.order.updateMany({
            where: {
                storeId,
                status: 'DELIVERED',
                platformCommission: { not: null },
                commissionPaid: false
            },
            data: {
                commissionPaid: true,
                commissionPaidAt: new Date(),
                commissionPaymentNote: paymentNote || null
            }
        });

        return NextResponse.json({
            success: true,
            message: `Marked ${result.count} orders as commission paid`,
            updatedCount: result.count
        });
    } catch (error) {
        console.error('Error marking commissions as paid:', error);
        return NextResponse.json(
            { error: 'Failed to mark commissions as paid' },
            { status: 500 }
        );
    }
}
