import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminApi } from '@/lib/server-auth';

// GET /api/admin/users - Liste tous les utilisateurs
export async function GET(request: NextRequest) {
    try {
        await requireAdminApi();

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');
        const role = searchParams.get('role');
        const search = searchParams.get('search');

        const skip = (page - 1) * limit;

        // Construire le filtre
        const where: any = {};
        if (role) where.role = role;
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } }
            ];
        }

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    roles: true,
                    createdAt: true,
                    _count: {
                        select: {
                            Order: true
                        }
                    },
                    Store: {
                        select: {
                            id: true,
                            name: true,
                            verified: true,
                            _count: {
                                select: {
                                    Product: true
                                }
                            }
                        }
                    }
                }
            }),
            prisma.user.count({ where })
        ]);

        // Map Prisma PascalCase to client-expected lowercase
        const mappedUsers = users.map(u => ({
            id: u.id,
            email: u.email,
            name: u.name,
            role: u.roles?.includes('ADMIN') ? 'ADMIN' :
                u.roles?.includes('SELLER') ? 'SELLER' :
                    u.roles?.includes('DELIVERY_AGENT') ? 'DELIVERY_AGENT' : u.role,
            roles: u.roles,
            createdAt: u.createdAt,
            _count: {
                orders: u._count.Order
            },
            store: u.Store ? {
                id: u.Store.id,
                name: u.Store.name,
                verified: u.Store.verified,
                _count: {
                    products: u.Store._count.Product
                }
            } : null
        }));

        return NextResponse.json({
            users: mappedUsers,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}
