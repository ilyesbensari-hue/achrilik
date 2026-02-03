import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth-token';
import { cookies } from 'next/headers';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
        }

        const payload = await verifyToken(token);
        if (!payload || !payload.id) {
            return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
        }

        // Check if user is a delivery agent
        const deliveryAgent = await prisma.deliveryAgent.findUnique({
            where: { userId: payload.id as string }
        });

        if (!deliveryAgent) {
            return NextResponse.json({ error: 'Accès refusé - Compte livreur requis' }, { status: 403 });
        }

        // Fetch deliveries assigned to this agent
        const deliveries = await prisma.delivery.findMany({
            where: {
                agentId: deliveryAgent.id
            },
            include: {
                order: {
                    select: {
                        id: true,
                        shippingName: true,
                        shippingPhone: true,
                        shippingAddress: true,
                        shippingWilaya: true,
                        deliveryLatitude: true,
                        deliveryLongitude: true,
                        total: true,
                        createdAt: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Calculate stats
        const stats = {
            totalAssigned: deliveries.length,
            delivered: deliveries.filter(d => d.status === 'DELIVERED').length,
            inTransit: deliveries.filter(d => d.status === 'IN_TRANSIT').length,
            codToCollect: deliveries
                .filter(d => !d.codCollected && d.codAmount)
                .reduce((sum, d) => sum + (d.codAmount || 0), 0),
            codToTransfer: deliveries
                .filter(d => d.codCollected && !d.codTransferred && d.codAmount)
                .reduce((sum, d) => sum + (d.codAmount || 0), 0)
        };

        return NextResponse.json({
            deliveries,
            stats
        });

    } catch (error) {
        console.error('Error fetching deliveries:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}

// Update delivery status
export async function PATCH(request: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
        }

        const payload = await verifyToken(token);
        if (!payload || !payload.id) {
            return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
        }

        const deliveryAgent = await prisma.deliveryAgent.findUnique({
            where: { userId: payload.id as string }
        });

        if (!deliveryAgent) {
            return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
        }

        const { deliveryId, status, codCollected, agentNotes } = await request.json();

        // Verify delivery belongs to this agent
        const delivery = await prisma.delivery.findUnique({
            where: { id: deliveryId }
        });

        if (!delivery || delivery.agentId !== deliveryAgent.id) {
            return NextResponse.json({ error: 'Livraison non trouvée' }, { status: 404 });
        }

        // Update delivery
        const updated = await prisma.delivery.update({
            where: { id: deliveryId },
            data: {
                status: status || delivery.status,
                codCollected: codCollected !== undefined ? codCollected : delivery.codCollected,
                codCollectedAt: codCollected && !delivery.codCollected ? new Date() : delivery.codCollectedAt,
                agentNotes: agentNotes || delivery.agentNotes,
                updatedAt: new Date()
            }
        });

        // Update agent stats if delivered
        if (status === 'DELIVERED' && delivery.status !== 'DELIVERED') {
            await prisma.deliveryAgent.update({
                where: { id: deliveryAgent.id },
                data: {
                    totalDeliveries: { increment: 1 }
                }
            });
        }

        return NextResponse.json({ success: true, delivery: updated });

    } catch (error) {
        console.error('Error updating delivery:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
