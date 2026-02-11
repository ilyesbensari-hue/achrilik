import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withCache } from '@/lib/cache';
import { verifyToken } from '@/lib/auth-token';

// GET /api/admin/stats - Statistiques globales et avancées (OPTIMIZED + CACHED)
export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get('auth_token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await verifyToken(token);

        if (!user || !user.roles?.includes('ADMIN')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        // Use cache wrapper with 5 minute TTL
        const stats = await withCache('admin-stats', async () => {
            // Compter les utilisateurs par rôle - EN PARALLÈLE
            const [totalUsers, buyers, sellers, admins] = await Promise.all([
                prisma.user.count(),
                prisma.user.count({ where: { roles: { has: 'BUYER' } } }),
                prisma.user.count({ where: { roles: { has: 'SELLER' } } }),
                prisma.user.count({ where: { roles: { has: 'ADMIN' } } })
            ]);

            // Compter les produits par statut
            const [totalProducts, pendingProducts, approvedProducts] = await Promise.all([
                prisma.product.count(),
                prisma.product.count({ where: { status: 'PENDING' } }),
                prisma.product.count({ where: { status: 'APPROVED' } })
            ]);

            // Dates pour les queries
            const now = new Date();
            const today = new Date(now.setHours(0, 0, 0, 0));
            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

            // Compter les commandes
            const [totalOrders, ordersToday, ordersThisWeek, ordersThisMonth] = await Promise.all([
                prisma.order.count(),
                prisma.order.count({ where: { createdAt: { gte: today } } }),
                prisma.order.count({ where: { createdAt: { gte: weekAgo } } }),
                prisma.order.count({ where: { createdAt: { gte: monthStart } } })
            ]);

            // ✅ OPTIMISATION CRITIQUE: Utiliser SQL natif au lieu de boucles
            // Croissance des utilisateurs (30 derniers jours) - 1 REQUÊTE au lieu de 30
            const userGrowthRaw: any[] = await prisma.$queryRaw`
            SELECT 
                DATE("createdAt") as date,
                COUNT(*)::int as count
            FROM "User"
            WHERE "createdAt" >= ${thirtyDaysAgo}
            GROUP BY DATE("createdAt")
            ORDER BY date ASC
        `;

            // Formater les résultats
            const userGrowth = userGrowthRaw.map((row: any) => ({
                date: row.date.toISOString().split('T')[0],
                count: row.count
            }));

            // Revenus par jour (30 derniers jours) - 1 REQUÊTE au lieu de 30
            const revenueByDayRaw: any[] = await prisma.$queryRaw`
            SELECT 
                DATE("createdAt") as date,
                SUM(total)::float as revenue,
                COUNT(*)::int as orders
            FROM "Order"
            WHERE "createdAt" >= ${thirtyDaysAgo}
            GROUP BY DATE("createdAt")
            ORDER BY date ASC
        `;

            const revenueByDay = revenueByDayRaw.map((row: any) => ({
                date: row.date.toISOString().split('T')[0],
                revenue: row.revenue || 0,
                orders: row.orders
            }));

            // Calculer les revenus - AGRÉGATION SQL directe
            const revenueStats: any[] = await prisma.$queryRaw`
            SELECT 
                SUM(total)::float as total_revenue,
                AVG(total)::float as avg_order_value
            FROM "Order"
        `;

            const thisMonthRevenue: any[] = await prisma.$queryRaw`
            SELECT SUM(total)::float as revenue
            FROM "Order"
            WHERE "createdAt" >= ${monthStart}
        `;

            const totalRevenue = revenueStats[0]?.total_revenue || 0;
            const averageOrderValue = revenueStats[0]?.avg_order_value || 0;

            // Nouveaux utilisateurs cette semaine
            const newUsersThisWeek = await prisma.user.count({
                where: { createdAt: { gte: weekAgo } }
            });

            // Top 10 produits - OPTIMISÉ avec groupBy
            const topProducts = await prisma.orderItem.groupBy({
                by: ['variantId'],
                _count: { variantId: true },
                _sum: { price: true, quantity: true },
                orderBy: { _count: { variantId: 'desc' } },
                take: 10
            });

            // Récupérer les détails des produits top EN PARALLÈLE
            const topProductDetails = await Promise.all(
                topProducts.map(async (item) => {
                    const variant = await prisma.variant.findUnique({
                        where: { id: item.variantId },
                        include: {
                            Product: {
                                select: {
                                    title: true,
                                    price: true
                                }
                            }
                        }
                    });

                    return {
                        productTitle: variant?.Product.title || 'Unknown',
                        orders: item._count.variantId,
                        totalQuantity: item._sum.quantity || 0,
                        totalRevenue: item._sum.price || 0
                    };
                })
            );

            // Commandes par statut - GroupBy au lieu de multiples counts
            const ordersByStatus = await prisma.order.groupBy({
                by: ['status'],
                _count: { status: true }
            });

            // Performance des catégories
            const categoryPerformance = await prisma.product.groupBy({
                by: ['categoryId'],
                _count: { categoryId: true }
            });

            const categoryDetails = await Promise.all(
                categoryPerformance.filter(cp => cp.categoryId).map(async (item) => {
                    const category = await prisma.category.findUnique({
                        where: { id: item.categoryId! }
                    });

                    return {
                        categoryName: category?.name || 'Unknown',
                        productCount: item._count.categoryId
                    };
                })
            );

            // Compter les boutiques (stores/vendors)
            const [totalStores, pendingStores, verifiedStores] = await Promise.all([
                prisma.store.count(),
                prisma.store.count({ where: { verified: false } }),
                prisma.store.count({ where: { verified: true } })
            ]);

            return NextResponse.json({
                users: {
                    total: totalUsers,
                    buyers,
                    sellers,
                    admins,
                    newThisWeek: newUsersThisWeek,
                    growth: userGrowth
                },
                products: {
                    total: totalProducts,
                    pending: pendingProducts,
                    approved: approvedProducts
                },
                stores: {
                    total: totalStores,
                    pending: pendingStores,
                    verified: verifiedStores
                },
                orders: {
                    total: totalOrders,
                    today: ordersToday,
                    thisWeek: ordersThisWeek,
                    thisMonth: ordersThisMonth,
                    byStatus: ordersByStatus
                },
                revenue: {
                    total: totalRevenue,
                    thisMonth: thisMonthRevenue[0]?.revenue || 0,
                    byDay: revenueByDay,
                    averageOrderValue
                },
                topProducts: topProductDetails,
                categories: categoryDetails
            });
        });

        return stats;
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}
