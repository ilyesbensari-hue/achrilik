import { cookies } from 'next/headers';
import { verifyToken } from './auth-token';
import { redirect } from 'next/navigation';

/**
 * Server-side authentication utilities for Next.js Server Components.
 * These run in Node.js runtime where cookies work reliably.
 */

export async function requireAuth() {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
        redirect('/login');
    }

    const user = await verifyToken(token);
    if (!user) {
        redirect('/login');
    }

    return user;
}

export async function requireAdmin() {
    const user = await requireAuth();
    if (user.role !== 'ADMIN') {
        redirect('/');
    }
    return user;
}

export async function requireSeller() {
    const user = await requireAuth();
    if (user.role !== 'SELLER' && user.role !== 'ADMIN') {
        redirect('/why-sell');
    }
    return user;
}

export async function getOptionalAuth() {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) return null;

    const user = await verifyToken(token);
    return user || null;
}
