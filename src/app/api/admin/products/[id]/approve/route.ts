import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logAdminAction, AdminActions, TargetTypes } from '@/lib/adminLogger';
import { sendTemplateEmail } from '@/lib/email';
import { requireAdminApi } from '@/lib/server-auth';

// POST /api/admin/products/[id]/approve - Approve a product
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        // Verify admin authentication
        const admin = await requireAdminApi();

        // Update product status
        const product = await prisma.product.update({
            where: { id },
            data: {
                status: 'APPROVED',
                rejectionReason: null
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
            adminId: admin.userId as string,
            action: AdminActions.APPROVE_PRODUCT,
            targetType: TargetTypes.PRODUCT,
            targetId: product.id,
            productId: product.id,
            details: {
                productTitle: product.title,
                sellerId: product.Store.ownerId
            }
        });

        // Revalidate cache after approval
        try {
            await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/admin/revalidate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    paths: [
                        '/',  // Homepage
                        `/products/${id}`,  // Product page
                        '/admin/products',  // Admin products list
                        '/categories/[slug]',  // Category pages
                        '/nouveautes'  // New arrivals page
                    ]
                })
            });
        } catch (e) {
            console.log('Cache revalidation failed (non-critical)');
        }

        // Send email notification to seller
        if (product.Store.User.email) {
            await sendTemplateEmail(
                product.Store.User.email,
                'product_approved',
                {
                    sellerName: product.Store.User.name || 'Vendeur',
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
        if (error instanceof Error && error.message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        return NextResponse.json(
            { error: 'Failed to approve product' },
            { status: 500 }
        );
    }
}
