import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth-token';
import { randomBytes } from 'crypto';

// POST /api/reviews - Créer un avis (RESTRICTED: produits achetés uniquement)
export async function POST(request: NextRequest) {
    try {
        const token = request.cookies.get('auth_token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Vous devez être connecté pour laisser un avis' }, { status: 401 });
        }

        const user = await verifyToken(token);
        if (!user) {
            return NextResponse.json({ error: 'Session invalide' }, { status: 401 });
        }

        const { productId, rating, title, comment } = await request.json();

        // Validation
        if (!productId || !rating) {
            return NextResponse.json({ error: 'Produit et note requis' }, { status: 400 });
        }

        if (rating < 1 || rating > 5) {
            return NextResponse.json({ error: 'La note doit être entre 1 et 5' }, { status: 400 });
        }

        // 🔒 CRITICAL: Vérifier que l'utilisateur a acheté ce produit
        const purchase = await prisma.order.findFirst({
            where: {
                userId: (user as any).id as string,
                status: 'DELIVERED', // Seulement les commandes livrées
                OrderItem: {
                    some: {
                        Variant: {
                            productId: productId
                        }
                    }
                }
            },
            include: {
                OrderItem: {
                    where: {
                        Variant: {
                            productId: productId
                        }
                    }
                }
            }
        });

        if (!purchase) {
            return NextResponse.json({
                error: 'Vous ne pouvez laisser un avis que sur les produits que vous avez achetés et reçus'
            }, { status: 403 });
        }

        // Vérifier si l'utilisateur n'a pas déjà laissé un avis
        const existingReview = await prisma.review.findUnique({
            where: {
                userId_productId: {
                    userId: (user as any).id as string,
                    productId: productId
                }
            }
        });

        if (existingReview) {
            return NextResponse.json({
                error: 'Vous avez déjà laissé un avis pour ce produit'
            }, { status: 400 });
        }

        // Créer l'avis
        const review = await prisma.review.create({
            data: {
                id: randomBytes(16).toString('hex'),
                productId,
                userId: (user as any).id as string,
                orderId: purchase.id,
                rating,
                title: title || null,
                comment: comment || null,
                isVerifiedPurchase: true // Toujours true puisqu'on vérifie l'achat
            },
            include: {
                User: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            }
        });

        return NextResponse.json({
            success: true,
            review
        });

    } catch (error) {
        console.error('Error creating review:', error);
        return NextResponse.json({ error: 'Erreur lors de la création de l\'avis' }, { status: 500 });
    }
}

// GET /api/reviews?productId=xxx - Récupérer les avis d'un produit
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const productId = searchParams.get('productId');

        if (!productId) {
            return NextResponse.json({ error: 'productId requis' }, { status: 400 });
        }

        const reviews = await prisma.review.findMany({
            where: { productId },
            include: {
                User: {
                    select: {
                        name: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Calculer les statistiques
        const totalReviews = reviews.length;
        const averageRating = totalReviews > 0
            ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / totalReviews
            : 0;

        const ratingDistribution = {
            5: reviews.filter((r: any) => r.rating === 5).length,
            4: reviews.filter((r: any) => r.rating === 4).length,
            3: reviews.filter((r: any) => r.rating === 3).length,
            2: reviews.filter((r: any) => r.rating === 2).length,
            1: reviews.filter((r: any) => r.rating === 1).length
        };

        return NextResponse.json({
            reviews,
            stats: {
                totalReviews,
                averageRating: Math.round(averageRating * 10) / 10,
                ratingDistribution
            }
        });

    } catch (error) {
        console.error('Error fetching reviews:', error);
        return NextResponse.json({ error: 'Erreur lors de la récupération des avis' }, { status: 500 });
    }
}
