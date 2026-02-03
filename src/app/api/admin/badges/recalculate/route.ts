import { NextResponse, NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth-token';
import { recalculateAllBadges } from '@/lib/badge-helpers';

export async function POST(request: NextRequest) {
    try {
        const token = request.cookies.get('auth_token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await verifyToken(token);

        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        const updatedCount = await recalculateAllBadges();

        return NextResponse.json({
            success: true,
            updatedCount,
            message: `${updatedCount} produits mis à jour`
        });
    } catch (error) {
        console.error('Recalculate badges error:', error);
        return NextResponse.json({ error: 'Failed to recalculate badges' }, { status: 500 });
    }
}
