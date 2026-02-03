import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth-token';

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const token = request.cookies.get('auth_token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await verifyToken(token);

        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        const { id } = await params;
        const body = await request.json();
        const { isNew, isTrending, isBestSeller } = body;

        // Update only the specified badges
        const updateData: any = {};
        if (isNew !== undefined) updateData.isNew = isNew;
        if (isTrending !== undefined) updateData.isTrending = isTrending;
        if (isBestSeller !== undefined) updateData.isBestSeller = isBestSeller;

        const product = await prisma.product.update({
            where: { id },
            data: updateData
        });

        return NextResponse.json(product);
    } catch (error) {
        console.error('Badge update error:', error);
        return NextResponse.json({ error: 'Failed to update badges' }, { status: 500 });
    }
}
