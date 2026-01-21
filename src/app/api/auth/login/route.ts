import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
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

        // 4. Set Cookie using cookies() API (Next.js 15+ compatible)
        const cookieStore = await cookies();
        cookieStore.set('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7 // 7 days
        });

        return NextResponse.json({
            success: true,
            user: {
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
