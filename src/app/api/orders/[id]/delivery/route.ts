import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth-token';

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: orderId } = await params;
        const token = request.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = await verifyToken(token);
        const userId = payload?.userId;

        const body = await request.json();
        const {
            deliveryStatus,
            trackingNumber,
            trackingUrl,
            codReceived,
            codReceivedAmount,
            paymentReceipt,
            sellerNotes,
        } = body;

        // Vérifier que la commande appartient au vendeur
        const order = await prisma.order.findFirst({
            where: {
                id: orderId,
            },
            include: {
                OrderItem: {
                    include: {
                        Variant: {
                            include: {
                                Product: {
                                    select: {
                                        storeId: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Vérifier que l'utilisateur est le vendeur de cette commande
        const isSeller = order.OrderItem.some(
            item => item.Variant.Product.storeId === order.storeId
        );

        if (!isSeller) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Préparer les données de mise à jour
        const updateData: any = {
            lastUpdatedBy: userId,
            lastUpdatedAt: new Date(),
        };

        if (deliveryStatus !== undefined) updateData.deliveryStatus = deliveryStatus;
        if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber;
        if (trackingUrl !== undefined) updateData.trackingUrl = trackingUrl;
        if (sellerNotes !== undefined) updateData.sellerNotes = sellerNotes;

        if (codReceived !== undefined) {
            updateData.codReceived = codReceived;
            if (codReceived) {
                updateData.codReceivedAt = new Date();
            }
        }

        if (codReceivedAmount !== undefined) updateData.codReceivedAmount = codReceivedAmount;
        if (paymentReceipt !== undefined) updateData.paymentReceipt = paymentReceipt;

        // Si livré, mettre à jour le statut de la commande
        if (deliveryStatus === 'DELIVERED') {
            updateData.status = 'DELIVERED';
        }

        // Mettre à jour la commande
        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: updateData,
        });

        return NextResponse.json({ success: true, order: updatedOrder });
    } catch (error: any) {
        console.error('Update delivery error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to update delivery' },
            { status: 500 }
        );
    }
}
