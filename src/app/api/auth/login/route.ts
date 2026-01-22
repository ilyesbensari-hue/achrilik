import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth-token';

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        // 1. Find User
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return NextResponse.json({ error: 'Email ou mot de passe incorrect' }, { status: 401 });
        }

        // 2. Check Password
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            // Fallback for legacy plain text (migration)
            if (password === user.password) {
                const hashed = await bcrypt.hash(password, 10);
                await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });
            } else {
                return NextResponse.json({ error: 'Email ou mot de passe incorrect' }, { status: 401 });
            }
        }

        // 3. Generate Token
        const token = await signToken({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
        });

        // 4. Set Cookie with explicit Domain for Edge Runtime compatibility
        const isProduction = process.env.NODE_ENV === 'production';
        const domain = isProduction ? '.achrilik.com' : undefined; // Leading dot allows subdomains

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
                role: user.role
            }
        });

        response.headers.set('Set-Cookie', cookieHeader);

        return response;

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
