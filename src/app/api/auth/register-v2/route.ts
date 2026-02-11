import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth-token';
import { sendWelcomeEmail } from '@/lib/mail';
import { randomBytes } from 'crypto';
import { registerRateLimit, getClientIp } from '@/lib/ratelimit';
import { logger } from '@/lib/logger';

const PHONE_REGEX = /^(0)(5|6|7)[0-9]{8}$/;

export async function POST(request: Request) {
    try {
        // Rate limiting check
        const ip = getClientIp(request);
        const { success } = await registerRateLimit.limit(ip);

        if (!success) {
            return NextResponse.json(
                { error: 'Trop de tentatives d\'inscription. Réessayez dans 1 minute.' },
                { status: 429 }
            );
        }

        const { email, password, name, phone, address, wilaya, city } = await request.json();

        // 1. Strict Validation
        if (!password || password.length < 8) {
            return NextResponse.json({ error: 'Le mot de passe doit contenir au moins 8 caractères.' }, { status: 400 });
        }

        // Phone is now optional - validate only if provided
        if (phone && !PHONE_REGEX.test(phone)) {
            return NextResponse.json({ error: 'Numéro de téléphone invalide (Doit commencer par 05, 06 ou 07 et contenir 10 chiffres).' }, { status: 400 });
        }

        // 2. Check Exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json({ error: 'Cet email est déjà utilisé.' }, { status: 400 });
        }

        // 3. Create User
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                id: randomBytes(16).toString('hex'),
                email,
                password: hashedPassword,
                name: name || email.split('@')[0],
                phone: phone || null, // Phone is now optional
                address: address || null,
                wilaya: wilaya || null,
                city: city || null,
                role: 'BUYER'
            }
        });

        // 4. Send Email (Async, don't block)
        sendWelcomeEmail(email, user.name || 'Client').catch(logger.error);

        // 5. Auto Login - Manual Set-Cookie (workaround for Next.js 15+ Vercel bug)
        const token = await signToken({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
        });

        const response = NextResponse.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

        // Construct Set-Cookie header with explicit Domain for Edge Runtime compatibility
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

        response.headers.set('Set-Cookie', cookieHeader);

        return response;

    } catch (error) {
        logger.error('Register error', { error: error as Error });
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
