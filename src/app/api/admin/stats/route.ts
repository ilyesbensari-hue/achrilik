import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminApi } from '@/lib/server-auth';
import { logger } from '@/lib/logger';

// GET /api/admin/stats
export async function GET(request: NextRequest) {
    try {
        await requireAdminApi();

        // Simplified stats - just counts first
        try {
            const [totalUsers, totalProducts, totalStores, totalOrders] = await Promise.all([
                prisma.user.count(),
                prisma.product.count(),
                prisma.store.count(),
                prisma.order.count()
            ]);

            // Simple role counts (fallback if array query fails)
            let buyers = 0, sellers = 0, admins = 0;
            try {
                const usersWithRoles = await prisma.user.findMany({
                    select: { roles: true }
                });
                buyers = usersWithRoles.filter(u => u.roles.includes('BUYER')).length;
                sellers = usersWithRoles.filter(u => u.roles.includes('SELLER')).length;
                admins = usersWithRoles.filter(u => u.roles.includes('ADMIN')).length;
            } catch (roleError) {
                logger.error('Role count error:', { error: roleError as Error });
            }

            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

            const newUsersThisWeek = await prisma.user.count({
                where: { createdAt: { gte: weekAgo } }
            });

            const [pendingProducts, approvedProducts] = await Promise.all([
                prisma.product.count({ where: { status: 'PENDING' } }),
                prisma.product.count({ where: { status: 'APPROVED' } })
            ]);

            const [pendingStores, verifiedStores] = await Promise.all([
                prisma.store.count({ where: { verified: false } }),
                prisma.store.count({ where: { verified: true } })
            ]);

            // Simplified date calculations
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

            const [ordersToday, ordersThisWeek, ordersThisMonth] = await Promise.all([
                prisma.order.count({ where: { createdAt: { gte: today } } }),
                prisma.order.count({ where: { createdAt: { gte: weekAgo } } }),
                prisma.order.count({ where: { createdAt: { gte: monthStart } } })
            ]);

            // Simple revenue calculation
            const orders = await prisma.order.findMany({
                select: { total: true }
            });
            const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
            const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

            const ordersThisMonthData = await prisma.order.findMany({
                where: { createdAt: { gte: monthStart } },
                select: { total: true }
            });
            const thisMonthRevenue = ordersThisMonthData.reduce((sum, order) => sum + order.total, 0);

            return NextResponse.json({
                users: {
                    total: totalUsers,
                    buyers,
                    sellers,
                    admins,
                    newThisWeek: newUsersThisWeek
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
                    thisMonth: ordersThisMonth
                },
                revenue: {
                    total: totalRevenue,
                    thisMonth: thisMonthRevenue,
                    averageOrderValue
                }
            });

        } catch (queryError) {
            logger.error('Stats query error:', { error: queryError as Error });
            throw queryError;
        }

    } catch (error) {
        logger.error('Admin stats error:', { error: error as Error });
        return NextResponse.json({
            error: 'Failed to fetch stats',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
