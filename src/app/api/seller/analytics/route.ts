import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
    try {
        // Get sellerId from query params
        const sellerId = req.nextUrl.searchParams.get('sellerId');

        if (!sellerId) {
            return NextResponse.json(
                { success: false, error: 'Seller ID required' },
                { status: 400 }
            );
        }

        // Get seller's store
        const store = await prisma.store.findUnique({
            where: { ownerId: sellerId }
        });

        if (!store) {
            return NextResponse.json(
                { success: false, error: 'Store not found' },
                { status: 404 }
            );
        }

        // Calculate date ranges
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        // Get all orders for this store's products - OPTIMIZED: filter at DB level
        const allOrders = await prisma.order.findMany({
            where: {
                OrderItem: {
                    some: {
                        Variant: {
                            Product: {
                                storeId: store.id
                            }
                        }
                    }
                }
            },
            include: {
                OrderItem: {
                    where: {
                        Variant: {
                            Product: {
                                storeId: store.id
                            }
                        }
                    },
                    include: {
                        Variant: {
                            select: {
                                id: true,
                                size: true,
                                color: true,
                                Product: {
                                    select: {
                                        id: true,
                                        title: true,
                                        images: true,
                                        storeId: true
                                    }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // No need to filter again - already filtered at DB level
        const storeOrders = allOrders;

        // Calculate metrics
        const todayOrders = storeOrders.filter(o => new Date(o.createdAt) >= todayStart);
        const weekOrders = storeOrders.filter(o => new Date(o.createdAt) >= weekStart);
        const monthOrders = storeOrders.filter(o => new Date(o.createdAt) >= monthStart);

        const calculateRevenue = (orders: typeof storeOrders) => {
            return orders.reduce((sum, order) => {
                const orderTotal = order.OrderItem.reduce((itemSum, item) => itemSum + item.price * item.quantity, 0);
                return sum + orderTotal;
            }, 0);
        };

        const todayRevenue = calculateRevenue(todayOrders);
        const weekRevenue = calculateRevenue(weekOrders);
        const monthRevenue = calculateRevenue(monthOrders);

        // Orders by status
        const ordersByStatus = {
            pending: storeOrders.filter(o => o.status === 'PENDING').length,
            confirmed: storeOrders.filter(o => o.status === 'CONFIRMED').length,
            readyForPickup: storeOrders.filter(o => o.status === 'READY_FOR_PICKUP').length,
            delivered: storeOrders.filter(o => o.status === 'DELIVERED').length,
            cancelled: storeOrders.filter(o => o.status === 'CANCELLED').length,
        };

        // Top selling products
        const productSales = new Map<string, { product: any; quantity: number; revenue: number }>();

        storeOrders.forEach(order => {
            order.OrderItem.forEach(item => {
                const productId = item.Variant.Product.id;
                const existing = productSales.get(productId);

                if (existing) {
                    existing.quantity += item.quantity;
                    existing.revenue += item.price * item.quantity;
                } else {
                    productSales.set(productId, {
                        product: item.Variant.Product,
                        quantity: item.quantity,
                        revenue: item.price * item.quantity
                    });
                }
            });
        });

        const topProducts = Array.from(productSales.values())
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 5)
            .map(p => ({
                id: p.product.id,
                title: p.product.title,
                image: p.product.images.split(',')[0],
                quantity: p.quantity,
                revenue: p.revenue
            }));

        // Sales over last 7 days
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

            const dayOrders = storeOrders.filter(o => {
                const orderDate = new Date(o.createdAt);
                return orderDate >= dayStart && orderDate < dayEnd;
            });

            return {
                date: dayStart.toISOString().split('T')[0],
                sales: calculateRevenue(dayOrders),
                orders: dayOrders.length
            };
        }).reverse();

        // Get store reviews
        const reviews = await prisma.review.findMany({
            where: {
                Product: {
                    storeId: store.id
                }
            }
        });

        const averageRating = reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : 0;

        return NextResponse.json({
            success: true,
            analytics: {
                metrics: {
                    today: {
                        orders: todayOrders.length,
                        revenue: todayRevenue
                    },
                    week: {
                        orders: weekOrders.length,
                        revenue: weekRevenue
                    },
                    month: {
                        orders: monthOrders.length,
                        revenue: monthRevenue
                    },
                    total: {
                        orders: storeOrders.length,
                        revenue: calculateRevenue(storeOrders)
                    }
                },
                ordersByStatus,
                topProducts,
                salesTrend: last7Days,
                storeRating: {
                    average: averageRating,
                    count: reviews.length
                }
            }
        });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch analytics' },
            { status: 500 }
        );
    }
}
