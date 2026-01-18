import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/admin/users - Liste tous les utilisateurs
export async function GET(request: Request) {
    try {
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
                    createdAt: true,
                    _count: {
                        select: {
                            orders: true
                        }
                    },
                    store: {
                        select: {
                            id: true,
                            name: true,
                            _count: {
                                select: {
                                    products: true
                                }
                            }
                        }
                    }
                }
            }),
            prisma.user.count({ where })
        ]);

        return NextResponse.json({
            users,
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
