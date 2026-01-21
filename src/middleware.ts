import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth-token';

export async function middleware(request: NextRequest) {
    const token = request.cookies.get('auth_token')?.value;
    const { pathname } = request.nextUrl;

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
        // Redirect to login if no token
        return NextResponse.redirect(new URL(`/login?callbackUrl=${pathname}`, request.url));
    }

    const payload = await verifyToken(token);

    // 3. If token invalid, redirect
    if (!payload) {
        return NextResponse.redirect(new URL(`/login?callbackUrl=${pathname}`, request.url));
    }

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
