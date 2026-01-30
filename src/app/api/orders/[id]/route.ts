import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const order = await prisma.order.findUnique({
            where: { id },
            include: {
                User: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                Store: true,
                OrderItem: {
                    include: {
                        Variant: {
                            include: {
                                Product: {
                                    select: {
                                        id: true,
                                        title: true,
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

        return NextResponse.json(order);
    } catch (error) {
        console.error('Get order failed:', error);
        return NextResponse.json({ error: 'Failed to get order' }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { status, cancellationReason, isPaid } = body;

        // Prepare update data
        const updateData: any = {};

        // Handle status update
        if (status !== undefined) {
            // Valid statuses
            const validStatuses = ['PENDING', 'CONFIRMED', 'READY', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
            if (!validStatuses.includes(status)) {
                return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
            }

            // If cancelling, require cancellationReason
            if (status === 'CANCELLED' && !cancellationReason) {
                return NextResponse.json({
                    error: 'Cancellation reason is required when cancelling an order'
                }, { status: 400 });
            }

            updateData.status = status;
        }

        // Handle cancellation reason
        if (cancellationReason !== undefined) {
            updateData.cancellationReason = cancellationReason;
        }

        // Handle payment status
        if (isPaid !== undefined) {
            updateData.isPaid = isPaid;
            if (isPaid === true) {
                updateData.paidAt = new Date();
            }
        }

        const order = await prisma.order.update({
            where: { id },
            data: updateData,
            include: { User: true } // Return user to potentially notify (future)
        });

        return NextResponse.json(order);
    } catch (error) {
        console.error('Update order failed:', error);
        return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
    }
}
