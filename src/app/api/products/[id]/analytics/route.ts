import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST endpoint to update analytics counters
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { type, quantity } = await req.json();

        if (!type) {
            return NextResponse.json(
                { success: false, error: 'Type is required' },
                { status: 400 }
            );
        }

        let updateData: any = {};

        switch (type) {
            case 'view':
                updateData = { viewCount: { increment: 1 } };
                break;

            case 'favorite':
                updateData = { favoriteCount: { increment: 1 } };
                break;

            case 'unfavorite':
                const product = await prisma.product.findUnique({
                    where: { id },
                    select: { favoriteCount: true },
                });

                if (product && product.favoriteCount > 0) {
                    updateData = { favoriteCount: { decrement: 1 } };
                }
                break;

            case 'sale':
                const saleQuantity = quantity || 1;
                updateData = { salesCount: { increment: saleQuantity } };
                break;

            default:
                return NextResponse.json(
                    { success: false, error: 'Invalid analytics type' },
                    { status: 400 }
                );
        }

        if (Object.keys(updateData).length > 0) {
            await prisma.product.update({
                where: { id },
                data: updateData,
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating product analytics:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update analytics' },
            { status: 500 }
        );
    }
}

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
                Store: true,
                Category: true,
                Variant: true,
                Review: {
                    include: {
                        User: {
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
                OrderItem: {
                    some: {
                        Variant: {
                            productId: id
                        }
                    }
                }
            },
            include: {
                OrderItem: {
                    where: {
                        Variant: {
                            productId: id
                        }
                    },
                    include: {
                        Variant: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Calculate metrics
        const totalSales = orders.reduce((sum, order) => {
            return sum + order.OrderItem.reduce((itemSum, item) => itemSum + item.quantity, 0);
        }, 0);

        const totalRevenue = orders.reduce((sum, order) => {
            return sum + order.OrderItem.reduce((itemSum, item) => itemSum + (item.price * item.quantity), 0);
        }, 0);

        // Sales by variant
        const variantSales = new Map<string, { variant: any; quantity: number; revenue: number }>();
        orders.forEach(order => {
            order.OrderItem.forEach(item => {
                const variantId = item.variantId;
                const existing = variantSales.get(variantId);

                if (existing) {
                    existing.quantity += item.quantity;
                    existing.revenue += item.price * item.quantity;
                } else {
                    variantSales.set(variantId, {
                        variant: item.Variant,
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
                return sum + order.OrderItem.reduce((itemSum, item) => itemSum + item.quantity, 0);
            }, 0);

            const dayRevenue = dayOrders.reduce((sum, order) => {
                return sum + order.OrderItem.reduce((itemSum, item) => itemSum + (item.price * item.quantity), 0);
            }, 0);

            return {
                date: dayStart.toISOString().split('T')[0],
                sales: daySales,
                revenue: dayRevenue
            };
        }).reverse();

        // Calculate average rating
        const averageRating = product.Review.length > 0
            ? product.Review.reduce((sum, r) => sum + r.rating, 0) / product.Review.length
            : 0;

        return NextResponse.json({
            success: true,
            analytics: {
                product: {
                    id: product.id,
                    title: product.title,
                    price: product.price,
                    images: product.images.split(','),
                    category: product.Category?.name
                },
                metrics: {
                    totalSales,
                    totalRevenue,
                    averageRating,
                    reviewCount: product.Review.length,
                    totalStock: product.Variant.reduce((sum, v) => sum + v.stock, 0)
                },
                variantPerformance,
                salesTrend: last30Days,
                recentReviews: product.Review.slice(0, 5).map(r => ({
                    id: r.id,
                    rating: r.rating,
                    comment: r.comment,
                    userName: r.User.name || r.User.email,
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
