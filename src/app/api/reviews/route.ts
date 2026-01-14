import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId, productId, rating, comment, images } = body;

        // Basic validation
        if (!userId || !productId || !rating) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Verify user exists
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Create Review
        const review = await prisma.review.create({
            data: {
                userId,
                productId,
                rating: parseInt(rating),
                comment,
                images // Expecting comma-separated string or handling array in frontend? Schema says String?
                // If frontend sends array, join it here.
            }
        });

        return NextResponse.json(review);
    } catch (error) {
        console.error('Failed to create review:', error);
        return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const productId = searchParams.get('productId');

        if (!productId) {
            return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
        }

        const reviews = await prisma.review.findMany({
            where: { productId },
            include: {
                user: {
                    select: { name: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(reviews);
    } catch (error) {
        console.error('Failed to fetch reviews:', error);
        return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
    }
}
