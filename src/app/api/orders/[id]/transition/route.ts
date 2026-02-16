import { NextRequest, NextResponse } from 'next/server';
import { hasRole, hasAnyRole } from "@/lib/role-helpers";
import { verifyToken } from '@/lib/auth-token';
import { prisma } from '@/lib/prisma';
import { getDeliveryFeeForStoreAndWilaya } from '@/lib/deliveryFeeCalculator';

// Define OrderStatus type inline to avoid Prisma import issues
type OrderStatus =
    | 'PENDING'
    | 'PAYMENT_PENDING'
    | 'CONFIRMED'
    | 'AT_MERCHANT'
    | 'READY_FOR_PICKUP'
    | 'WITH_DELIVERY_AGENT'
    | 'OUT_FOR_DELIVERY'
    | 'DELIVERED'
    | 'RETURNED'
    | 'CANCELLED';

// Allowed transitions matrix
const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
    PENDING: ['PAYMENT_PENDING', 'CONFIRMED', 'CANCELLED'],
    PAYMENT_PENDING: ['CONFIRMED', 'CANCELLED'],
    CONFIRMED: ['AT_MERCHANT', 'CANCELLED'],
    AT_MERCHANT: ['READY_FOR_PICKUP', 'CANCELLED'],
    READY_FOR_PICKUP: ['WITH_DELIVERY_AGENT', 'CANCELLED'],
    WITH_DELIVERY_AGENT: ['OUT_FOR_DELIVERY', 'READY_FOR_PICKUP'],
    OUT_FOR_DELIVERY: ['DELIVERED', 'RETURNED'],
    DELIVERED: [],
    RETURNED: [],
    CANCELLED: []
};

// Role permissions for status transitions
const ROLE_PERMISSIONS: Record<string, OrderStatus[]> = {
    BUYER: ['CONFIRMED', 'CANCELLED'],
    SELLER: ['CONFIRMED', 'AT_MERCHANT', 'READY_FOR_PICKUP', 'CANCELLED'],
    DELIVERY_AGENT: ['WITH_DELIVERY_AGENT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'RETURNED'],
    ADMIN: ['PENDING', 'PAYMENT_PENDING', 'CONFIRMED', 'AT_MERCHANT', 'READY_FOR_PICKUP', 'WITH_DELIVERY_AGENT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'RETURNED', 'CANCELLED']
};

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const token = req.cookies.get('auth_token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
        }

        const user = await verifyToken(token);

        if (!user) {
            return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
        }

        const { newStatus, notes } = await req.json();
        // Next.js 16: params is now async
        const resolvedParams = await params;
        const orderId = resolvedParams.id;

        if (!newStatus) {
            return NextResponse.json({ error: 'Statut requis' }, { status: 400 });
        }

        // Fetch order with Store to check ownership
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                OrderItem: {
                    include: {
                        Variant: {
                            include: {
                                Product: {
                                    include: {
                                        Store: true
                                    }
                                }
                            }
                        }
                    }
                },
                User: true
            }
        });

        if (!order) {
            return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 });
        }

        // Determine user's effective role for this order
        let effectiveRole: string = (user.role as string) || 'BUYER';

        // Check if user is the seller for this order (owns the store)
        if (order.OrderItem && order.OrderItem.length > 0) {
            const firstStore = order.OrderItem[0].Variant.Product.Store;
            if (firstStore && firstStore.ownerId === user.id) {
                effectiveRole = 'SELLER';
            }
        }

        // Check if user is the customer
        if (order.userId === user.id && effectiveRole !== 'SELLER') {
            effectiveRole = 'BUYER';
        }

        // Check if user has permission for this status
        const allowedStatuses = ROLE_PERMISSIONS[effectiveRole] || [];
        if (!allowedStatuses.includes(newStatus as OrderStatus)) {
            return NextResponse.json(
                { error: `Vous n'avez pas la permission de changer le statut à ${newStatus}` },
                { status: 403 }
            );
        }

        // Check if transition is valid
        const currentStatus = order.status as OrderStatus;
        const allowedTransitions = ALLOWED_TRANSITIONS[currentStatus] || [];

        if (!allowedTransitions.includes(newStatus as OrderStatus)) {
            return NextResponse.json(
                { error: `Transition impossible de ${currentStatus} à ${newStatus}` },
                { status: 400 }
            );
        }

        // Prepare history entry
        const existingHistory = Array.isArray(order.statusHistory)
            ? order.statusHistory
            : [];

        const newHistoryEntry = {
            from: currentStatus,
            to: newStatus,
            at: new Date().toISOString(),
            by: user.id,
            byRole: effectiveRole,
            note: notes || undefined
        };

        // Build update data
        const updateData: any = {
            status: newStatus,
            statusHistory: [...existingHistory, newHistoryEntry],
            lastUpdatedAt: new Date(),
            lastUpdatedBy: user.id
        };

        // Add notes if provided
        if (effectiveRole === 'SELLER' && notes) {
            updateData.merchantNotes = notes;
        }
        if (effectiveRole === 'DELIVERY_AGENT' && notes) {
            updateData.deliveryNotes = notes;
        }

        // Update order
        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: updateData,
            include: {
                OrderItem: {
                    include: {
                        Variant: {
                            include: {
                                Product: true
                            }
                        }
                    }
                },
                User: {
                    select: {
                        name: true,
                        email: true,
                        phone: true
                    }
                }
            }
        });

        // =========================================
        // AUTO-CREATE DELIVERY ON READY_FOR_PICKUP
        // =========================================
        // When seller marks order as ready for pickup, automatically create delivery
        if (newStatus === 'READY_FOR_PICKUP') {
            try {
                // Check if delivery already exists
                const existingDelivery = await prisma.delivery.findUnique({
                    where: { orderId: orderId }
                });

                if (!existingDelivery) {
                    // Find default delivery agent
                    const defaultAgent = await prisma.deliveryAgent.findFirst({
                        where: {
                            user: { email: 'livreur@achrilik.com' },
                            isActive: true
                        }
                    });

                    if (defaultAgent) {
                        // Generate tracking number
                        const timestamp = Date.now();
                        const random = Math.random().toString(36).substr(2, 6).toUpperCase();
                        const trackingNumber = `ACH-${timestamp}-${random}`;

                        // ✅ Calculate delivery fee from config
                        const deliveryFee = await getDeliveryFeeForStoreAndWilaya(
                            updatedOrder.storeId,
                            updatedOrder.shippingWilaya
                        );

                        // Create delivery
                        await prisma.delivery.create({
                            data: {
                                id: require('crypto').randomBytes(12).toString('hex'),
                                orderId: orderId,
                                agentId: defaultAgent.id,
                                trackingNumber: trackingNumber,
                                status: 'PENDING',
                                assignedAt: new Date(),
                                codAmount: updatedOrder.paymentMethod === 'COD' ? updatedOrder.total : 0,
                                codCollected: false,
                                deliveryFee: deliveryFee  // ✅ Auto-calculated
                            }
                        });

                        console.log('[DELIVERY AUTO-CREATED]', {
                            orderId: orderId,
                            agentId: defaultAgent.id,
                            trackingNumber
                        });
                    } else {
                        console.warn('[DELIVERY AUTO-CREATE] No default agent found');
                    }
                }
            } catch (deliveryErr) {
                console.error('[DELIVERY AUTO-CREATE ERROR]', deliveryErr);
                // Non-blocking error - order status still updated
            }
        }

        // =========================================
        // SYNC ORDER STATUS → DELIVERY STATUS
        // =========================================
        // When order status changes, sync to existing delivery
        const existingDelivery = await prisma.delivery.findUnique({
            where: { orderId: orderId }
        });

        if (existingDelivery) {
            const reverseMapping: Record<string, 'PENDING' | 'IN_TRANSIT' | 'DELIVERED' | 'FAILED'> = {
                'READY_FOR_PICKUP': 'PENDING',
                'OUT_FOR_DELIVERY': 'IN_TRANSIT',
                'DELIVERED': 'DELIVERED',
                'CANCELLED': 'FAILED'  // Map order CANCELLED to delivery FAILED
            };

            const mappedDeliveryStatus = reverseMapping[newStatus as string];
            if (mappedDeliveryStatus && mappedDeliveryStatus !== existingDelivery.status) {
                await prisma.delivery.update({
                    where: { id: existingDelivery.id },
                    data: {
                        status: mappedDeliveryStatus,
                        updatedAt: new Date()
                    }
                });

                console.log('[STATUS SYNC] Order → Delivery', {
                    orderId: orderId,
                    deliveryId: existingDelivery.id,
                    orderStatus: newStatus,
                    deliveryStatus: mappedDeliveryStatus
                });
            }
        }

        // =========================================
        // AUTO-CALCULATE PLATFORM COMMISSION
        // =========================================
        // When order becomes DELIVERED, calculate commission if not already set
        if (newStatus === 'DELIVERED' && !updatedOrder.platformCommission) {
            try {
                // Get current commission rate from settings
                const commissionSettings = await prisma.platformSettings.findFirst({
                    orderBy: { updatedAt: 'desc' }
                });

                if (commissionSettings && commissionSettings.commissionRate > 0) {
                    const commissionAmount = (updatedOrder.total * commissionSettings.commissionRate) / 100;

                    // Update order with commission info
                    await prisma.order.update({
                        where: { id: orderId },
                        data: {
                            platformCommission: commissionAmount,
                            platformCommissionRate: commissionSettings.commissionRate
                        }
                    });

                    console.log('[COMMISSION CALCULATED]', {
                        orderId: orderId,
                        orderTotal: updatedOrder.total,
                        commissionRate: commissionSettings.commissionRate,
                        commissionAmount: commissionAmount
                    });
                } else {
                    console.log('[COMMISSION SKIPPED] Rate is 0% or no settings found');
                }
            } catch (commissionErr) {
                console.error('[COMMISSION CALCULATION ERROR]', commissionErr);
                // Non-blocking error - order status still updated
            }
        }

        return NextResponse.json({
            success: true,
            order: updatedOrder,
            transition: newHistoryEntry
        });
    } catch (error) {
        console.error('Erreur transition statut:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la transition du statut' },
            { status: 500 }
        );
    }
}
