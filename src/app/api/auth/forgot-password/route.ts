import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendPasswordResetEmail } from '@/lib/mail';
import crypto from 'crypto';

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ error: 'Email requis' }, { status: 400 });
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email }
        });

        // Always return success (security: don't reveal if email exists)
        if (!user) {
            return NextResponse.json({
                success: true,
                message: 'Si cet email existe, un lien de réinitialisation a été envoyé.'
            });
        }

        // Delete old tokens for this user
        await prisma.passwordResetToken.deleteMany({
            where: { userId: user.id }
        });

        // Generate secure token
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        // Create reset token
        await prisma.passwordResetToken.create({
            data: {
                id: crypto.randomBytes(16).toString('hex'),
                userId: user.id,
                token,
                expiresAt
            }
        });

        // Send email
        await sendPasswordResetEmail(user.email, token, user.name || 'Utilisateur');

        return NextResponse.json({
            success: true,
            message: 'Si cet email existe, un lien de réinitialisation a été envoyé.'
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
