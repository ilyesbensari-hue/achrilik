import { randomBytes } from 'crypto';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth-token';
import { generateTrackingNumber, calculateEstimatedDelivery, findBestDeliveryAgent } from '@/lib/delivery-helpers';
import { getDeliveryFeeForStoreAndWilaya } from '@/lib/deliveryFeeCalculator';

/**
 * POST /api/admin/deliveries/assign
 * Assign a delivery to an agent
 */
export async function POST(request: Request) {
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

        const body = await request.json();
        const { orderId, agentId, pickupAddress, deliveryAddress, wilaya } = body;

        // Validate required fields
        if (!orderId || !pickupAddress || !deliveryAddress) {
            return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
        }

        // Check if order exists and is confirmed
        const order = await prisma.order.findUnique({
            where: { id: orderId }
        });

        if (!order) {
            return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 });
        }

        // Allow delivery creation for confirmed orders or those ready for pickup
        const validStatuses = ['CONFIRMED', 'AT_MERCHANT', 'READY_FOR_PICKUP'];
        if (!validStatuses.includes(order.status)) {
            return NextResponse.json({
                error: 'La commande doit être confirmée pour être assignée'
            }, { status: 400 });
        }

        // Check if delivery already exists for this order
        const existingDelivery = await prisma.delivery.findFirst({
            where: { orderId }
        });

        if (existingDelivery) {
            return NextResponse.json({
                error: 'Une livraison existe déjà pour cette commande'
            }, { status: 400 });
        }

        // Find agent or use best available
        let selectedAgentId = agentId;

        if (!selectedAgentId) {
            const orderWilaya = wilaya || order.shippingWilaya || 'Oran';
            selectedAgentId = await findBestDeliveryAgent(prisma, orderWilaya);

            if (!selectedAgentId) {
                return NextResponse.json({
                    error: `Aucun prestataire disponible pour ${orderWilaya}`
                }, { status: 404 });
            }
        }

        // Verify agent exists and is available
        const agent = await prisma.deliveryAgent.findUnique({
            where: { id: selectedAgentId }
        });

        if (!agent) {
            return NextResponse.json({ error: 'Prestataire introuvable' }, { status: 404 });
        }

        if (!agent.isActive) {
            return NextResponse.json({ error: 'Prestataire non actif' }, { status: 400 });
        }

        // Generate tracking number
        const trackingNumber = generateTrackingNumber();

        // Calculate COD amount
        const codAmount = order.paymentMethod === 'COD' ? order.total : 0;

        // ✅ Calculate delivery fee from config
        const deliveryFee = await getDeliveryFeeForStoreAndWilaya(
            order.storeId,
            order.shippingWilaya
        );

        // Create delivery
        const delivery = await prisma.delivery.create({
            data: {
                id: randomBytes(12).toString('hex'),
                orderId,
                agentId: selectedAgentId,
                trackingNumber,
                status: 'PENDING',
                assignedAt: new Date(),
                codAmount,
                codCollected: false,
                deliveryFee: deliveryFee  // ✅ Auto-calculated
            },
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
                        total: true
                    }
                }
            }
        });

        // Update order status to WITH_DELIVERY_AGENT when assigned
        if (order.status === 'CONFIRMED' || order.status === 'AT_MERCHANT' || order.status === 'READY_FOR_PICKUP') {
            await prisma.order.update({
                where: { id: orderId },
                data: { status: 'WITH_DELIVERY_AGENT' }
            });
        }

        return NextResponse.json({
            success: true,
            delivery: {
                id: delivery.id,
                trackingNumber: delivery.trackingNumber,
                orderId: delivery.orderId,
                agentName: delivery.agent?.user.name,
                agentPhone: delivery.agent?.user.phone,
                status: delivery.status,
                codAmount: delivery.codAmount
            }
        }, { status: 201 });

    } catch (error) {
        console.error('Error assigning delivery:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
