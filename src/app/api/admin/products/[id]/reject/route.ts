import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logAdminAction, AdminActions, TargetTypes } from '@/lib/adminLogger';
import { sendTemplateEmail } from '@/lib/email';

// POST /api/admin/products/[id]/reject - Reject a product
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const { adminId, reason } = await request.json();

        if (!adminId || !reason) {
            return NextResponse.json(
                { error: 'Admin ID and rejection reason required' },
                { status: 400 }
            );
        }

        // Update product status
        const product = await prisma.product.update({
            where: { id },
            data: {
                status: 'REJECTED',
                rejectionReason: reason
            },
            include: {
                Store: {
                    include: {
                        User: true
                    }
                }
            }
        });

        // Log admin action
        await logAdminAction({
            adminId,
            action: AdminActions.REJECT_PRODUCT,
            targetType: TargetTypes.PRODUCT,
            targetId: product.id,
            productId: product.id,
            details: {
                productTitle: product.title,
                sellerId: product.Store.ownerId,
                rejectionReason: reason
            }
        });

        // Send email notification to seller
        if (product.Store.User.email) {
            await sendTemplateEmail(
                product.Store.User.email,
                'product_rejected',
                {
                    sellerName: product.Store.User.name || 'Vendeur',
                    productTitle: product.title,
                    rejectionReason: reason,
                    dashboardUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/sell`
                }
            );
        }

        return NextResponse.json({
            success: true,
            product
        });
    } catch (error) {
        console.error('Error rejecting product:', error);
        return NextResponse.json(
            { error: 'Failed to reject product' },
            { status: 500 }
        );
    }
}
