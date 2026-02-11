import { NextResponse } from 'next/server';
import { hasRole, hasAnyRole } from "@/lib/role-helpers";
import { verifyToken, signToken } from '@/lib/auth-token';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
        }

        const payload = await verifyToken(token);
        if (!payload || !payload.id) {
            return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
        }

        const { role } = await request.json();

        // Fetch user with roles
        const user = await prisma.user.findUnique({
            where: { id: payload.id as string }
        });

        if (!user) {
            return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
        }

        // Verify user has this role
        if (!user.roles.includes(role as Role)) {
            return NextResponse.json({ error: 'Rôle non autorisé' }, { status: 403 });
        }

        // Reorder roles to make selected role primary
        const newRoles = [
            role,
            ...user.roles.filter(r => r !== role)
        ];

        // Generate new token with updated active role
        const newToken = await signToken({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role, // Deprecated
            roles: newRoles,
            activeRole: role
        });

        // Set new cookie
        const isProduction = process.env.NODE_ENV === 'production';
        // FIX: Do not force domain .achrilik.com if running locally (even in prod mode)
        const domain = isProduction && !process.env.NEXT_PUBLIC_URL?.includes('localhost') ? '.achrilik.com' : undefined;

        const cookieHeader = [
            `auth_token=${newToken}`,
            'HttpOnly',
            isProduction ? 'Secure' : '',
            'SameSite=Lax',
            'Path=/',
            domain ? `Domain=${domain}` : '',
            `Max-Age=${60 * 60 * 24 * 7}`
        ].filter(Boolean).join('; ');

        const response = NextResponse.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                roles: newRoles,
                activeRole: role
            }
        });

        response.headers.set('Set-Cookie', cookieHeader);

        return response;

    } catch (error) {
        console.error('Error switching role:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
