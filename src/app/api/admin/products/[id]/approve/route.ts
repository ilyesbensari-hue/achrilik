import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logAdminAction, AdminActions, TargetTypes } from '@/lib/adminLogger';
import { sendTemplateEmail } from '@/lib/email';

// POST /api/admin/products/[id]/approve - Approve a product
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const { adminId } = await request.json();

        if (!adminId) {
            return NextResponse.json(
                { error: 'Admin ID required' },
                { status: 400 }
            );
        }

        // Update product status
        const product = await prisma.product.update({
            where: { id },
            data: {
                status: 'APPROVED',
                rejectionReason: null
            },
            include: {
                store: {
                    include: {
                        owner: true
                    }
                }
            }
        });

        // Log admin action
        await logAdminAction({
            adminId,
            action: AdminActions.APPROVE_PRODUCT,
            targetType: TargetTypes.PRODUCT,
            targetId: product.id,
            productId: product.id,
            details: {
                productTitle: product.title,
                sellerId: product.store.ownerId
            }
        });

        // Send email notification to seller
        if (product.store.owner.email) {
            await sendTemplateEmail(
                product.store.owner.email,
                'product_approved',
                {
                    sellerName: product.store.owner.name || 'Vendeur',
                    productTitle: product.title,
                    productUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/products/${product.id}`
                }
            );
        }

        return NextResponse.json({
            success: true,
            product
        });
    } catch (error) {
        console.error('Error approving product:', error);
        return NextResponse.json(
            { error: 'Failed to approve product' },
            { status: 500 }
        );
    }
}
