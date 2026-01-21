import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth-token';

export async function middleware(request: NextRequest) {
    const token = request.cookies.get('auth_token')?.value;
    const { pathname } = request.nextUrl;

    // DEBUG: Log all cookies received by middleware
    console.log('[MIDDLEWARE DEBUG]', {
        pathname,
        hasToken: !!token,
        tokenLength: token?.length || 0,
        allCookies: Array.from(request.cookies.getAll()).map(c => c.name),
        headers: Object.fromEntries(request.headers.entries())
    });

    // Define protected routes
    const isProtected =
        pathname.startsWith('/admin') ||
        pathname.startsWith('/sell') ||
        pathname.startsWith('/checkout') ||
        pathname.startsWith('/profile');

    // 1. If route is public, continue
    if (!isProtected) {
        return NextResponse.next();
    }

    // 2. Start verifying token
    if (!token) {
        console.log('[MIDDLEWARE] No token found, redirecting to login');
        // Redirect to login if no token
        return NextResponse.redirect(new URL(`/login?callbackUrl=${pathname}`, request.url));
    }

    const payload = await verifyToken(token);

    // 3. If token invalid, redirect
    if (!payload) {
        console.log('[MIDDLEWARE] Token invalid, redirecting to login');
        return NextResponse.redirect(new URL(`/login?callbackUrl=${pathname}`, request.url));
    }

    console.log('[MIDDLEWARE] Token valid, allowing access', { user: payload.email });

    // 4. Role Protection (Admin)
    if (pathname.startsWith('/admin') && payload.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/', request.url)); // Access denied
    }

    // 5. Role Protection (Seller)
    if (pathname.startsWith('/sell') && payload.role !== 'SELLER' && payload.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/why-sell', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
