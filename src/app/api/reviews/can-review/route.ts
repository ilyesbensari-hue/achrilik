import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth-token';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');

    if (!productId) {
        return NextResponse.json({ canReview: false, hasAlreadyReviewed: false });
    }

    // Check auth
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) {
        return NextResponse.json({ canReview: false, hasAlreadyReviewed: false });
    }

    const userData = await verifyToken(token);
    if (!userData) {
        return NextResponse.json({ canReview: false, hasAlreadyReviewed: false });
    }

    const userId = userData.userId as string;

    try {
        // Step 1: Get all variant IDs for this specific product
        const variants = await prisma.variant.findMany({
            where: { productId },
            select: { id: true },
        });

        if (variants.length === 0) {
            // Product has no variants, so can never have been purchased
            return NextResponse.json({ canReview: false, hasAlreadyReviewed: false });
        }

        const variantIds = variants.map((v) => v.id);

        // Step 2: Check if user has a DELIVERED order containing any of these variants
        const purchasedItem = await prisma.orderItem.findFirst({
            where: {
                variantId: { in: variantIds },
                Order: {
                    userId,
                    status: 'DELIVERED',
                },
            },
            select: { id: true },
        });

        const canReview = !!purchasedItem;

        // Step 3: Check if user already left a review for this product
        const existingReview = await prisma.review.findFirst({
            where: {
                productId,
                userId,
            },
            select: { id: true },
        });

        const hasAlreadyReviewed = !!existingReview;

        return NextResponse.json({ canReview, hasAlreadyReviewed });
    } catch (error) {
        console.error('can-review error:', error);
        return NextResponse.json({ canReview: false, hasAlreadyReviewed: false });
    }
}
