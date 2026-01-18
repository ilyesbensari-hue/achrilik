import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Get product with all related data
        const product = await prisma.product.findUnique({
            where: { id },
            include: {
                store: true,
                category: true,
                variants: true,
                reviews: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                email: true
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!product) {
            return NextResponse.json(
                { success: false, error: 'Product not found' },
                { status: 404 }
            );
        }

        // Get all orders containing this product
        const orders = await prisma.order.findMany({
            where: {
                items: {
                    some: {
                        variant: {
                            productId: id
                        }
                    }
                }
            },
            include: {
                items: {
                    where: {
                        variant: {
                            productId: id
                        }
                    },
                    include: {
                        variant: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Calculate metrics
        const totalSales = orders.reduce((sum, order) => {
            return sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
        }, 0);

        const totalRevenue = orders.reduce((sum, order) => {
            return sum + order.items.reduce((itemSum, item) => itemSum + (item.price * item.quantity), 0);
        }, 0);

        // Sales by variant
        const variantSales = new Map<string, { variant: any; quantity: number; revenue: number }>();
        orders.forEach(order => {
            order.items.forEach(item => {
                const variantId = item.variantId;
                const existing = variantSales.get(variantId);

                if (existing) {
                    existing.quantity += item.quantity;
                    existing.revenue += item.price * item.quantity;
                } else {
                    variantSales.set(variantId, {
                        variant: item.variant,
                        quantity: item.quantity,
                        revenue: item.price * item.quantity
                    });
                }
            });
        });

        const variantPerformance = Array.from(variantSales.values())
            .sort((a, b) => b.quantity - a.quantity)
            .map(v => ({
                size: v.variant.size,
                color: v.variant.color,
                stock: v.variant.stock,
                sold: v.quantity,
                revenue: v.revenue
            }));

        // Sales over last 30 days
        const now = new Date();
        const last30Days = Array.from({ length: 30 }, (_, i) => {
            const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

            const dayOrders = orders.filter(o => {
                const orderDate = new Date(o.createdAt);
                return orderDate >= dayStart && orderDate < dayEnd;
            });

            const daySales = dayOrders.reduce((sum, order) => {
                return sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
            }, 0);

            const dayRevenue = dayOrders.reduce((sum, order) => {
                return sum + order.items.reduce((itemSum, item) => itemSum + (item.price * item.quantity), 0);
            }, 0);

            return {
                date: dayStart.toISOString().split('T')[0],
                sales: daySales,
                revenue: dayRevenue
            };
        }).reverse();

        // Calculate average rating
        const averageRating = product.reviews.length > 0
            ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
            : 0;

        return NextResponse.json({
            success: true,
            analytics: {
                product: {
                    id: product.id,
                    title: product.title,
                    price: product.price,
                    images: product.images.split(','),
                    category: product.category?.name
                },
                metrics: {
                    totalSales,
                    totalRevenue,
                    averageRating,
                    reviewCount: product.reviews.length,
                    totalStock: product.variants.reduce((sum, v) => sum + v.stock, 0)
                },
                variantPerformance,
                salesTrend: last30Days,
                recentReviews: product.reviews.slice(0, 5).map(r => ({
                    id: r.id,
                    rating: r.rating,
                    comment: r.comment,
                    userName: r.user.name || r.user.email,
                    createdAt: r.createdAt
                }))
            }
        });
    } catch (error) {
        console.error('Error fetching product analytics:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch analytics' },
            { status: 500 }
        );
    }
}
