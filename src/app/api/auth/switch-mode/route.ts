import { NextResponse } from 'next/server';
import { verifyToken, signToken } from '@/lib/auth-token';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/auth/switch-mode
 * Switch between buyer and seller mode for users with SELLER role
 */
export async function POST(request: Request) {
    try {
        const token = request.headers.get('cookie')?.split('auth_token=')[1]?.split(';')[0];

        if (!token) {
            return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
        }

        const payload = await verifyToken(token);
        if (!payload) {
            return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
        }

        const body = await request.json();
        const { mode } = body; // 'buyer' | 'seller'

        if (!mode || !['buyer', 'seller'].includes(mode)) {
            return NextResponse.json({ error: 'Mode invalide' }, { status: 400 });
        }

        // Verify user exists and has appropriate roles
        const user = await prisma.user.findUnique({
            where: { id: payload.id as string },
            include: {
                Store: true
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
        }

        const roles = user.role.split(',');

        // Check if switching to seller mode
        if (mode === 'seller') {
            if (!roles.includes('SELLER')) {
                return NextResponse.json({
                    error: 'Vous n\'avez pas de compte vendeur'
                }, { status: 403 });
            }

            // Check if store is verified
            if (!user.Store?.verified) {
                return NextResponse.json({
                    error: 'Votre compte vendeur n\'est pas encore validé',
                    redirectTo: '/account/pending'
                }, { status: 403 });
            }
        }

        // Generate new token with updated mode
        const newToken = await signToken({
            id: user.id,
            email: user.email,
            name: user.name || '',
            role: user.role,
            roles: roles,
            activeMode: mode,
            storeId: user.Store?.id
        });

        // Determine redirect URL
        const redirectTo = mode === 'seller' ? '/sell' : '/';

        const response = NextResponse.json({
            success: true,
            mode,
            redirectTo,
            message: mode === 'seller'
                ? 'Mode vendeur activé'
                : 'Mode acheteur activé'
        });

        // Set new token cookie
        response.cookies.set('auth_token', newToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/'
        });

        return response;

    } catch (error) {
        console.error('Error switching mode:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
