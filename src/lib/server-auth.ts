import { cookies } from 'next/headers';
import { verifyToken } from './auth-token';
import { redirect } from 'next/navigation';
import { hasRole, hasAnyRole } from './role-helpers';

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

    // Allow access if user has ADMIN role OR if email matches ADMIN_EMAIL env var
    const isAdmin = hasRole(user, 'ADMIN') ||
        (process.env.ADMIN_EMAIL && user.email === process.env.ADMIN_EMAIL);

    if (!isAdmin) {
        redirect('/');
    }
    return user;
}

export async function requireSeller() {
    const user = await requireAuth();
    if (!hasAnyRole(user, ['SELLER', 'ADMIN'])) {
        // Redirect BUYER to store creation page instead of why-sell
        redirect('/become-seller');
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

// API Helper - Throws error instead of redirect
export async function requireAdminApi() {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
        throw new Error('Unauthorized');
    }

    const user = await verifyToken(token);
    if (!user) {
        throw new Error('Forbidden');
    }

    // Allow access if user has ADMIN role OR if email matches ADMIN_EMAIL env var
    const isAdmin = hasRole(user, 'ADMIN') ||
        (process.env.ADMIN_EMAIL && user.email === process.env.ADMIN_EMAIL);

    if (!isAdmin) {
        throw new Error('Forbidden');
    }

    return user;
}
