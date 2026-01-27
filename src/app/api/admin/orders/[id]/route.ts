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
            // Delete order items first
            await tx.orderItem.deleteMany({
                where: { orderId: id }
            });

            // Delete the order
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
