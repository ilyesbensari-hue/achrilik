import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        // Auth check
        const headersList = headers();
        const cookie = headersList.get('cookie') || '';

        if (!cookie.includes('session')) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        const body = await request.json();
        const { agentId, note } = body;

        if (!agentId) {
            return NextResponse.json({ error: 'agentId requis' }, { status: 400 });
        }

        // Mark all collected COD for this agent as transferred
        const result = await prisma.delivery.updateMany({
            where: {
                agentId,
                codCollected: true,
                codTransferred: false
            },
            data: {
                codTransferred: true,
                codTransferredAt: new Date()
            }
        });

        return NextResponse.json({
            success: true,
            updatedCount: result.count,
            message: `${result.count} livraison(s) marquée(s) comme transférée(s)`
        });

    } catch (error) {
        console.error('Error marking COD as transferred:', error);
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        );
    }
}
