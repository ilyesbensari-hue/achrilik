import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminApi } from '@/lib/server-auth';

// DELETE /api/admin/orders/[id]
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireAdminApi();
        const { id } = await params;

        await prisma.$transaction(async (tx) => {
            // Delete in cascade order to respect foreign key constraints:

            // 1. Delete reviews linked to this order
            await tx.review.deleteMany({
                where: { orderId: id }
            });

            // 2. Delete delivery if exists
            const delivery = await tx.delivery.findUnique({
                where: { orderId: id }
            });

            if (delivery) {
                await tx.delivery.delete({
                    where: { orderId: id }
                });
            }

            // 3. Delete order items
            await tx.orderItem.deleteMany({
                where: { orderId: id }
            });

            // 4. Delete the order itself
            await tx.order.delete({
                where: { id }
            });
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting order:', error);
        return NextResponse.json(
            { error: 'Failed to delete order' },
            { status: 500 }
        );
    }
}
