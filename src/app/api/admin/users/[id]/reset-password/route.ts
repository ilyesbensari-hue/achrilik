import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        // In a real app, verify ADMIN session here.
        // For this demo, we assume the caller is authorized or we check headers.
        // TODO: Add proper middleware/session check.

        const { newPassword } = await request.json();

        if (!newPassword || newPassword.length < 6) {
            return NextResponse.json({ error: 'Mot de passe trop court' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const updatedUser = await prisma.user.update({
            where: { id },
            data: { password: hashedPassword },
        });

        return NextResponse.json({ success: true, message: 'Mot de passe réinitialisé' });
    } catch (error) {
        console.error('Reset password error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
