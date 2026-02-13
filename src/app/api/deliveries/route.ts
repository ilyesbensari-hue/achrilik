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
                        shippingCity: true,
                        deliveryLatitude: true,
                        deliveryLongitude: true,
                        total: true,
                        createdAt: true,
                        Store: {
                            select: {
                                name: true,
                                address: true,
                                city: true,
                                storageCity: true,
                                phone: true,
                                latitude: true,
                                longitude: true,
                                User: {
                                    select: {
                                        name: true,
                                        phone: true,
                                        email: true
                                    }
                                }
                            }
                        },
                        OrderItem: {
                            select: {
                                quantity: true,
                                price: true,
                                Variant: {
                                    select: {
                                        size: true,
                                        color: true,
                                        Product: {
                                            select: {
                                                title: true,
                                                images: true
                                            }
                                        }
                                    }
                                }
                            }
                        }
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

        // Helper to safely parse product images
        const parseProductImage = (images: string | null): string | null => {
            if (!images) return null;
            try {
                // Try to parse as JSON array
                const parsed = JSON.parse(images);
                return Array.isArray(parsed) ? parsed[0] : images;
            } catch {
                // If not JSON, assume it's a plain URL string
                return images;
            }
        };

        // Map deliveries with complete pickup/delivery info
        const deliveriesWithDetails = deliveries.map(d => ({
            ...d,
            // Delivery info (Point B - client)
            totalAmount: d.order?.total || 0,
            customerName: d.order?.shippingName || '',
            customerPhone: d.order?.shippingPhone || '',
            deliveryAddress: `${d.order?.shippingAddress || ''}, ${d.order?.shippingCity || ''}, ${d.order?.shippingWilaya || ''}`.trim(),
            deliveryLatitude: d.order?.deliveryLatitude || null,
            deliveryLongitude: d.order?.deliveryLongitude || null,
            deliveryWilaya: d.order?.shippingWilaya || '',

            // Pickup info (Point A - vendor/store)
            storeName: d.order?.Store?.name || 'Magasin',
            storeAddress: d.order?.Store?.address || '',
            storeCity: d.order?.Store?.city || d.order?.Store?.storageCity || '',
            storePhone: d.order?.Store?.phone || d.order?.Store?.User?.phone || '',
            storeContact: d.order?.Store?.User?.name || '',
            storeLatitude: d.order?.Store?.latitude || null,
            storeLongitude: d.order?.Store?.longitude || null,
            pickupAddress: d.order?.Store?.address
                ? `${d.order.Store.address}, ${d.order.Store.city || d.order.Store.storageCity || ''}`.trim()
                : 'Adresse non renseignée',

            // Order items details
            items: (d.order?.OrderItem || []).map((item: any) => ({
                productName: item.Variant?.Product?.title || 'Produit',
                image: parseProductImage(item.Variant?.Product?.images),
                size: item.Variant?.size || '',
                color: item.Variant?.color || '',
                quantity: item.quantity,
                price: item.price
            }))
        }));

        return NextResponse.json({
            deliveries: deliveriesWithDetails,
            stats
        });

    } catch (error) {
        console.error('Error fetching deliveries:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        return NextResponse.json({
            error: 'Erreur serveur',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
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
