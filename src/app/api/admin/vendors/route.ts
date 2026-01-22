import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth-token';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

/**
 * GET /api/admin/vendors
 * Fetch all vendors/stores with filter options
 * Query params: ?status=pending|verified|all
 */
export async function GET(request: NextRequest) {
    try {
        // Verify admin authentication
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
        }

        const payload = await verifyToken(token);
        if (!payload) {
            return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
        }

        // Check if user is admin
        const admin = await prisma.user.findUnique({
            where: { id: payload.userId as string },
        });

        if (!admin || admin.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
        }

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
                owner: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        createdAt: true
                    }
                },
                _count: {
                    select: {
                        Product: true,
                        Order: true
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
                owner: store.owner,
                productCount: store._count.Product,
                orderCount: store._count.Order
            }))
        });

    } catch (error) {
        console.error('Error fetching vendors:', error);
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}
