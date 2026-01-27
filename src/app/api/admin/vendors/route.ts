import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminApi } from '@/lib/server-auth';

/**
 * GET /api/admin/vendors
 * Fetch all vendors/stores with filter options
 * Query params: ?status=pending|verified|all
 */
export async function GET(request: NextRequest) {
    try {
        await requireAdminApi();

        // Get filter from query params
        const { searchParams } = new URL(request.url);
        const statusFilter = searchParams.get('status') || 'all';

        // Build where clause based on filter
        let whereClause = {};
        if (statusFilter === 'pending') {
            whereClause = { verified: false };
        } else if (statusFilter === 'verified') {
            whereClause = { verified: true };
        }
        // 'all' includes everything, no where clause needed

        // Fetch vendors with owner info and product counts
        const vendors = await prisma.store.findMany({
            where: whereClause,
            include: {
                User: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        createdAt: true
                    }
                },
                _count: {
                    select: {
                        Product: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json({
            vendors: vendors.map(store => ({
                id: store.id,
                name: store.name,
                description: store.description,
                verified: store.verified,
                verifiedAt: store.verifiedAt,
                verifiedBy: store.verifiedBy,
                createdAt: store.createdAt,
                address: store.address,
                city: store.city,
                phone: store.phone,
                clickCollect: store.clickCollect,
                owner: store.User,
                productCount: store._count.Product,
            }))
        });

    } catch (error) {
        console.error('Error fetching vendors:', error);
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        );
    }
}
