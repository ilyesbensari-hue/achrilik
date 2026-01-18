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
                    store: true,
                    category: true,
                    variants: true,
                    reviews: true,
                    _count: {
                        select: { wishlists: true }
                    }
                },
                orderBy: [
                    { wishlists: { _count: 'desc' } },
                    { createdAt: 'desc' }
                ]
            });

            return NextResponse.json({ success: true, products });
        }

        // Get user's wishlist to understand preferences
        const wishlist = await prisma.wishlist.findMany({
            where: { userId },
            include: {
                product: {
                    include: {
                        category: true
                    }
                }
            }
        });

        if (wishlist.length === 0) {
            // No wishlist items, return popular products
            const products = await prisma.product.findMany({
                take: 12,
                include: {
                    store: true,
                    category: true,
                    variants: true,
                    reviews: true,
                    _count: {
                        select: { wishlists: true }
                    }
                },
                orderBy: [
                    { wishlists: { _count: 'desc' } },
                    { createdAt: 'desc' }
                ]
            });

            return NextResponse.json({ success: true, products });
        }

        // Extract category IDs from wishlist
        const categoryIds = new Set(
            wishlist
                .map(w => w.product.categoryId)
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
                store: true,
                category: true,
                variants: true,
                reviews: true,
                _count: {
                    select: { wishlists: true }
                }
            }
        });

        // Score and sort recommendations
        const scoredProducts = recommendations.map(product => {
            const avgRating = product.reviews.length > 0
                ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
                : 0;

            // Scoring: category match (40%), rating (30%), popularity (30%)
            const categoryScore = categoryIds.has(product.categoryId || '') ? 0.4 : 0;
            const ratingScore = (avgRating / 5) * 0.3;
            const popularityScore = Math.min(product._count.wishlists / 10, 1) * 0.3;

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
