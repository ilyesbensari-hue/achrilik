import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ token: string }> }
) {
    try {
        const { token } = await params;
        const { newPassword } = await request.json();

        if (!newPassword || newPassword.length < 8) {
            return NextResponse.json({
                error: 'Le mot de passe doit contenir au moins 8 caractères'
            }, { status: 400 });
        }

        // Find valid token
        const resetToken = await prisma.passwordResetToken.findUnique({
            where: { token },
            include: { user: true }
        });

        if (!resetToken) {
            return NextResponse.json({
                error: 'Lien de réinitialisation invalide ou expiré'
            }, { status: 400 });
        }

        // Check expiration
        if (new Date() > resetToken.expiresAt) {
            await prisma.passwordResetToken.delete({
                where: { id: resetToken.id }
            });
            return NextResponse.json({
                error: 'Lien de réinitialisation expiré'
            }, { status: 400 });
        }

        // Update password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: resetToken.userId },
            data: { password: hashedPassword }
        });

        // Delete used token
        await prisma.passwordResetToken.delete({
            where: { id: resetToken.id }
        });

        return NextResponse.json({
            success: true,
            message: 'Mot de passe réinitialisé avec succès'
        });

    } catch (error) {
        console.error('Reset password error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
