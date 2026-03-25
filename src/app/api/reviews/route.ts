import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth-token';
import { cookies } from 'next/headers';

// GET /api/reviews?productId=xxx — Fetch all reviews for a product
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');

    if (!productId) {
        return NextResponse.json({ error: 'productId required' }, { status: 400 });
    }

    try {
        const reviews = await prisma.review.findMany({
            where: { productId },
            orderBy: { createdAt: 'desc' },
            include: {
                User: { select: { name: true } },
            },
        });

        // Normalize for frontend (expects review.user.name)
        const normalized = reviews.map((r) => ({
            ...r,
            user: r.User,
        }));

        return NextResponse.json(normalized);
    } catch (error) {
        console.error('GET /api/reviews error:', error);
        return NextResponse.json([]);
    }
}

// POST /api/reviews — Submit a review (verified buyers only)
export async function POST(req: NextRequest) {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
        return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const userData = await verifyToken(token);
    if (!userData) {
        return NextResponse.json({ error: 'Session invalide' }, { status: 401 });
    }

    const userId = userData.userId as string;
    const { productId, rating, comment } = await req.json();

    if (!productId || !rating || Number(rating) < 1 || Number(rating) > 5) {
        return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
    }

    try {
        // Step 1: Get all variant IDs for this product
        const variants = await prisma.variant.findMany({
            where: { productId },
            select: { id: true },
        });

        if (variants.length === 0) {
            return NextResponse.json(
                { error: 'Vous devez avoir acheté ce produit pour laisser un avis.' },
                { status: 403 }
            );
        }

        const variantIds = variants.map((v) => v.id);

        // Step 2: Verify the user has a DELIVERED order containing one of these variants
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

        if (!purchasedItem) {
            return NextResponse.json(
                { error: 'Vous devez avoir acheté ce produit pour laisser un avis.' },
                { status: 403 }
            );
        }

        // Step 3: Check for duplicate review
        const existing = await prisma.review.findFirst({
            where: { productId, userId },
        });

        if (existing) {
            return NextResponse.json({ error: 'Vous avez déjà laissé un avis.' }, { status: 409 });
        }

        // Step 4: Create the review
        const review = await prisma.review.create({
            data: {
                productId,
                userId,
                rating: Number(rating),
                comment: comment?.trim() || null,
            },
            include: { User: { select: { name: true } } },
        });

        return NextResponse.json({ ...review, user: review.User }, { status: 201 });
    } catch (error) {
        console.error('POST /api/reviews error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
