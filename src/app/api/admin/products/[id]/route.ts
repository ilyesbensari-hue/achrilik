import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminApi } from '@/lib/server-auth';
import { logAdminAction, AdminActions, TargetTypes } from '@/lib/adminLogger';

// DELETE /api/admin/products/[id]
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const admin = await requireAdminApi();
        const { id } = await params;

        const product = await prisma.product.delete({
            where: { id },
            include: { Store: true } // for logging context
        });

        // Log action
        await logAdminAction({
            adminId: admin.userId as string,
            action: AdminActions.DELETE_PRODUCT,
            targetType: TargetTypes.PRODUCT,
            targetId: id,
            details: { title: product.title, storeId: product.storeId }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting product:', error);
        return NextResponse.json(
            { error: 'Failed to delete product' },
            { status: 500 }
        );
    }
}
