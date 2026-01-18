import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/wishlist - Get user's wishlist
export async function GET(req: NextRequest) {
    try {
        // Get userId from session/auth (for now using query param)
        const userId = req.nextUrl.searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { success: false, error: 'User not authenticated' },
                { status: 401 }
            );
        }

        const wishlist = await prisma.wishlist.findMany({
            where: { userId },
            include: {
                product: {
                    include: {
                        store: true,
                        category: true,
                        variants: true,
                        reviews: true,
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Transform to match product format
        const products = wishlist.map(w => ({
            ...w.product,
            wishlistId: w.id,
            addedAt: w.createdAt
        }));

        return NextResponse.json({ success: true, products });
    } catch (error) {
        console.error('Error fetching wishlist:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch wishlist' },
            { status: 500 }
        );
    }
}

// POST /api/wishlist - Add product to wishlist
export async function POST(req: NextRequest) {
    try {
        const { userId, productId } = await req.json();

        if (!userId || !productId) {
            return NextResponse.json(
                { success: false, error: 'Missing userId or productId' },
                { status: 400 }
            );
        }

        // Check if already in wishlist
        const existing = await prisma.wishlist.findUnique({
            where: {
                userId_productId: { userId, productId }
            }
        });

        if (existing) {
            return NextResponse.json(
                { success: false, error: 'Product already in wishlist' },
                { status: 400 }
            );
        }

        const wishlistItem = await prisma.wishlist.create({
            data: { userId, productId }
        });

        return NextResponse.json({
            success: true,
            wishlistItem,
            message: 'Product added to wishlist'
        });
    } catch (error) {
        console.error('Error adding to wishlist:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to add to wishlist' },
            { status: 500 }
        );
    }
}

// DELETE /api/wishlist - Remove product from wishlist
export async function DELETE(req: NextRequest) {
    try {
        const { userId, productId } = await req.json();

        if (!userId || !productId) {
            return NextResponse.json(
                { success: false, error: 'Missing userId or productId' },
                { status: 400 }
            );
        }

        await prisma.wishlist.delete({
            where: {
                userId_productId: { userId, productId }
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Product removed from wishlist'
        });
    } catch (error) {
        console.error('Error removing from wishlist:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to remove from wishlist' },
            { status: 500 }
        );
    }
}
