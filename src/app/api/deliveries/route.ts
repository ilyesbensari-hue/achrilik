import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth-token';
import { cookies } from 'next/headers';
import { sendTrackingUrlNotification } from '@/lib/mail';

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

        // Map deliveries to include totalAmount and GPS coords
        const deliveriesWithTotal = deliveries.map(d => ({
            ...d,
            totalAmount: d.order?.total || 0,
            customerName: d.order?.shippingName || '',
            customerPhone: d.order?.shippingPhone || '',
            deliveryAddress: d.order?.shippingAddress || '',
            deliveryLatitude: d.order?.deliveryLatitude || null,
            deliveryLongitude: d.order?.deliveryLongitude || null,
            pickupAddress: 'Magasin' // Will be enhanced later
        }));

        return NextResponse.json({
            deliveries: deliveriesWithTotal,
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

        const { deliveryId, status, codCollected, agentNotes, trackingNumber, trackingUrl } = await request.json();

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
                trackingNumber: trackingNumber !== undefined ? trackingNumber : delivery.trackingNumber,
                trackingUrl: trackingUrl !== undefined ? trackingUrl : delivery.trackingUrl,
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

        // Send tracking URL notification if tracking URL was just added
        if (trackingUrl && (!delivery.trackingUrl || delivery.trackingUrl !== trackingUrl)) {
            try {
                const order = await prisma.order.findUnique({
                    where: { id: delivery.orderId },
                    include: { User: true }
                });

                if (order?.User?.email) {
                    await sendTrackingUrlNotification(
                        order.User.email,
                        order,
                        trackingUrl
                    ).catch(err => console.error('[EMAIL ERROR] Tracking URL notification failed:', err));
                }
            } catch (emailErr) {
                console.error('[EMAIL ERROR] Failed to send tracking URL notification:', emailErr);
                // Non-blocking error
            }
        }

        return NextResponse.json({ success: true, delivery: updated });

    } catch (error) {
        console.error('Error updating delivery:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
