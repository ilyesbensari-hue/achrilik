import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth-token';
import { prisma } from '@/lib/prisma';

// Search customers API (admin/support only)
export async function GET(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
        }

        const payload = await verifyToken(token);
        if (!payload || !payload.id) {
            return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
        }

        // Check if user is admin (support role will be added later)
        const user = await prisma.user.findUnique({
            where: { id: payload.id as string }
        });

        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Accès refusé - Admin uniquement' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q') || '';

        if (!query || query.length < 3) {
            return NextResponse.json({ customers: [] });
        }

        // Search customers by email, name, or phone
        const customers = await prisma.user.findMany({
            where: {
                OR: [
                    { email: { contains: query, mode: 'insensitive' } },
                    { name: { contains: query, mode: 'insensitive' } },
                    { phone: { contains: query } }
                ]
            },
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                address: true,
                city: true,
                wilaya: true,
                createdAt: true,
                roles: true
            },
            take: 10
        });

        return NextResponse.json({ customers });

    } catch (error) {
        console.error('Error searching customers:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
