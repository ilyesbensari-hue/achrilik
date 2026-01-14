import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { status } = body;

        // Valid statuses
        const validStatuses = ['PENDING', 'CONFIRMED', 'READY', 'DELIVERED', 'CANCELLED'];
        if (!validStatuses.includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        const order = await prisma.order.update({
            where: { id },
            data: { status },
            include: { user: true } // Return user to potentially notify (future)
        });

        return NextResponse.json(order);
    } catch (error) {
        console.error('Update order failed:', error);
        return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
    }
}
