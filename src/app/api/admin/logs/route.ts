import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/adminAuth';

// GET /api/admin/logs - Fetch admin logs with filters
export async function GET(request: NextRequest) {
    const guard = await requireAdminAuth(request);
    if (guard) return guard;

    try {
        const searchParams = request.nextUrl.searchParams;
        const action = searchParams.get('action');
        const targetType = searchParams.get('targetType');
        const adminId = searchParams.get('adminId');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');

        // Build filter
        const where: any = {};

        if (action) {
            where.action = action;
        }

        if (targetType) {
            where.targetType = targetType;
        }

        if (adminId) {
            where.adminId = adminId;
        }

        // Fetch logs with pagination
        const [logs, total] = await Promise.all([
            prisma.adminLog.findMany({
                where,
                include: {
                    User: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    },
                    Product: {
                        select: {
                            id: true,
                            title: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit
            }),
            prisma.adminLog.count({ where })
        ]);

        return NextResponse.json({
            logs,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error('Error fetching admin logs:', error);
        return NextResponse.json(
            { error: 'Failed to fetch logs' },
            { status: 500 }
        );
    }
}
