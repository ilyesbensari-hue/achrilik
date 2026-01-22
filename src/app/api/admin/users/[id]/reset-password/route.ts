import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { verifyToken } from '@/lib/auth-token';
import { cookies } from 'next/headers';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
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

        const admin = await prisma.user.findUnique({
            where: { id: payload.userId as string },
        });

        if (!admin || admin.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
        }

        const { id } = await params;
        const { newPassword } = await request.json();

        if (!newPassword || newPassword.length < 8) {
            return NextResponse.json({ error: 'Mot de passe trop court (min 8 caractères)' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id },
            data: { password: hashedPassword },
        });

        // Log admin action
        await prisma.adminLog.create({
            data: {
                adminId: admin.id,
                action: 'RESET_PASSWORD',
                targetType: 'USER',
                targetId: id,
                details: `Reset password for user ${id}`,
            },
        });

        return NextResponse.json({ success: true, message: 'Mot de passe réinitialisé' });
    } catch (error) {
        console.error('Reset password error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
