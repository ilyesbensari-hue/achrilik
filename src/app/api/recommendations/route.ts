import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
    try {
        const userId = req.nextUrl.searchParams.get('userId');

        if (!userId) {
            // Return popular products if not authenticated
            const products = await prisma.product.findMany({
                take: 12,
                include: {
                    Store: true,
                    Category: true,
                    Variant: true,
                    Review: true,
                    _count: {
                        select: { Wishlist: true }
                    }
                },
                orderBy: [
                    { Wishlist: { _count: 'desc' } },
                    { createdAt: 'desc' }
                ]
            });

            return NextResponse.json({ success: true, products });
        }

        // Get user's wishlist to understand preferences
        const wishlist = await prisma.wishlist.findMany({
            where: { userId },
            include: {
                Product: {
                    include: {
                        Category: true
                    }
                }
            }
        });

        if (wishlist.length === 0) {
            // No wishlist items, return popular products
            const products = await prisma.product.findMany({
                take: 12,
                include: {
                    Store: true,
                    Category: true,
                    Variant: true,
                    Review: true,
                    _count: {
                        select: { Wishlist: true }
                    }
                },
                orderBy: [
                    { Wishlist: { _count: 'desc' } },
                    { createdAt: 'desc' }
                ]
            });

            return NextResponse.json({ success: true, products });
        }

        // Extract category IDs from wishlist
        const categoryIds = new Set(
            wishlist
                .map(w => w.Product.categoryId)
                .filter((id): id is string => id !== null)
        );

        const wishlistProductIds = wishlist.map(w => w.productId);

        // Find similar products in the same categories
        const recommendations = await prisma.product.findMany({
            where: {
                AND: [
                    {
                        categoryId: {
                            in: Array.from(categoryIds)
                        }
                    },
                    {
                        id: {
                            notIn: wishlistProductIds // Exclude products already in wishlist
                        }
                    }
                ]
            },
            take: 20,
            include: {
                Store: true,
                Category: true,
                Variant: true,
                Review: true,
                _count: {
                    select: { Wishlist: true }
                }
            }
        });

        // Score and sort recommendations
        const scoredProducts = recommendations.map(product => {
            const avgRating = product.Review.length > 0
                ? product.Review.reduce((sum, r) => sum + r.rating, 0) / product.Review.length
                : 0;

            // Scoring: category match (40%), rating (30%), popularity (30%)
            const categoryScore = categoryIds.has(product.categoryId || '') ? 0.4 : 0;
            const ratingScore = (avgRating / 5) * 0.3;
            const popularityScore = Math.min(product._count.Wishlist / 10, 1) * 0.3;

            const totalScore = categoryScore + ratingScore + popularityScore;

            return {
                ...product,
                score: totalScore
            };
        });

        // Sort by score and take top 12
        const topRecommendations = scoredProducts
            .sort((a, b) => b.score - a.score)
            .slice(0, 12);

        return NextResponse.json({
            success: true,
            products: topRecommendations
        });
    } catch (error) {
        console.error('Error fetching recommendations:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch recommendations' },
            { status: 500 }
        );
    }
}
