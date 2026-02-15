import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminApi } from '@/lib/server-auth';

export async function POST(request: Request) {
    try {
        await requireAdminApi();

        const body = await request.json();
        const { agentId, note } = body;

        if (!agentId) {
            return NextResponse.json({ error: 'agentId requis' }, { status: 400 });
        }

        // Mark all unpaid delivery fees for this agent as paid
        const result = await prisma.delivery.updateMany({
            where: {
                agentId,
                status: 'DELIVERED',
                agentPaid: false,
                deliveryFee: { gt: 0 }
            },
            data: {
                agentPaid: true,
                agentPaidAt: new Date(),
                agentPaymentNote: note || undefined
            }
        });

        return NextResponse.json({
            success: true,
            updatedCount: result.count,
            message: `${result.count} livraison(s) payée(s)`
        });

    } catch (error) {
        console.error('Error marking agent as paid:', error);
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        );
    }
}
