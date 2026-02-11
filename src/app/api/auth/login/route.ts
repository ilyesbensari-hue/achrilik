import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth-token';
import { loginRateLimit, getClientIp } from '@/lib/ratelimit';
import { logger } from '@/lib/logger';

export async function POST(request: Request) {
    try {
        // Rate limiting check with fallback
        const ip = getClientIp(request);

        try {
            const { success } = await loginRateLimit.limit(ip);
            if (!success) {
                return NextResponse.json(
                    { error: 'Trop de tentatives de connexion. Réessayez dans 1 minute.' },
                    { status: 429 }
                );
            }
        } catch (rateLimitError) {
            // Log the error but allow login to proceed (graceful degradation)
            logger.error('Rate limit error (Upstash unavailable):', rateLimitError);
            // Continue with login - rate limiting temporarily disabled
        }

        const { email, password, loginType } = await request.json();

        // 1. Find User
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return NextResponse.json({ error: 'Email ou mot de passe incorrect' }, { status: 401 });
        }

        // 2. Check Password
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return NextResponse.json({ error: 'Email ou mot de passe incorrect' }, { status: 401 });
        }

        // 3. Generate Token with roles (handle null/undefined roles safely)
        const userRoles = user.roles || [user.role]; // Fallback to legacy role if roles is null

        // Determine active role based on login type
        let activeRole = userRoles[0]; // Default to first role (usually BUYER)

        if (loginType === 'seller' && userRoles.includes('SELLER')) {
            activeRole = 'SELLER';
        } else if (loginType === 'delivery' && userRoles.includes('DELIVERY_AGENT')) {
            activeRole = 'DELIVERY_AGENT';
        }

        const token = await signToken({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role, // Deprecated, for backward compatibility
            roles: userRoles, // New multi-role support
            activeRole: activeRole // Set active role based on selection
        });

        // 4. Set Cookie with explicit Domain for Edge Runtime compatibility
        const isProduction = process.env.NODE_ENV === 'production';
        // FIX: Do not force domain .achrilik.com if running locally (even in prod mode)
        const domain = isProduction && !process.env.NEXT_PUBLIC_URL?.includes('localhost') ? '.achrilik.com' : undefined;

        const cookieHeader = [
            `auth_token=${token}`,
            'HttpOnly',
            isProduction ? 'Secure' : '',
            'SameSite=Lax',
            'Path=/',
            domain ? `Domain=${domain}` : '',
            `Max-Age=${60 * 60 * 24 * 7}` // 7 days
        ].filter(Boolean).join('; ');

        const response = NextResponse.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role, // Deprecated
                roles: userRoles, // New
                activeRole: activeRole
            }
        });

        response.headers.set('Set-Cookie', cookieHeader);

        return response;

    } catch (error) {
        logger.error('Login error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
