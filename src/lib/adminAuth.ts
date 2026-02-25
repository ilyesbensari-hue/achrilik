import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth-token';

/**
 * Guard centralisé pour les routes admin.
 * Utilise le JWT custom du projet (cookie: auth_token).
 * Usage: const guard = await requireAdminAuth(request); if (guard) return guard;
 */
export async function requireAdminAuth(request: NextRequest): Promise<NextResponse | null> {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
        return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }
    const payload = await verifyToken(token);
    if (!payload) {
        return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }
    const role = payload.role || (payload.roles as string[] | undefined)?.[0];
    if (role !== 'ADMIN') {
        return NextResponse.json({ error: 'Accès refusé — droits admin requis' }, { status: 403 });
    }
    return null;
}

/**
 * Guard vendeur (SELLER ou ADMIN).
 */
export async function requireSellerAuth(request: NextRequest): Promise<NextResponse | null> {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
        return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }
    const payload = await verifyToken(token);
    if (!payload) {
        return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }
    const role = payload.role || (payload.roles as string[] | undefined)?.[0];
    if (role !== 'SELLER' && role !== 'ADMIN') {
        return NextResponse.json({ error: 'Accès refusé — droits vendeur requis' }, { status: 403 });
    }
    return null;
}

/**
 * Guard utilisateur connecté (tout rôle).
 */
export async function requireAuth(request: NextRequest): Promise<NextResponse | null> {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
        return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }
    const payload = await verifyToken(token);
    if (!payload) {
        return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }
    return null;
}

