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

    try {
        // Check if user has a DELIVERED order containing this product (via Variant)
        const deliveredOrder = await prisma.order.findFirst({
            where: {
                userId: userData.userId as string,
                status: 'DELIVERED',
                OrderItem: {
                    some: {
                        Variant: { productId },
                    },
                },
            },
            select: { id: true },
        });

        const canReview = !!deliveredOrder;

        // Check if user has already left a review for this product
        const existingReview = await prisma.review.findFirst({
            where: {
                productId,
                userId: userData.userId as string,
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
