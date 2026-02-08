import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { rateLimit } from '@/lib/rate-limiter';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // ========================================
    // 1. MAINTENANCE MODE CHECK
    // ========================================
    const isMaintenanceMode = process.env.MAINTENANCE_MODE === 'true';

    if (isMaintenanceMode) {
        // Allow access to maintenance page itself
        if (!pathname.startsWith('/maintenance')) {
            // Optional: whitelist admin IPs
            const adminIPs = process.env.ADMIN_IPS?.split(',') || [];
            const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '';
            const isAdmin = adminIPs.some(ip => clientIP.includes(ip));

            if (!isAdmin) {
                return NextResponse.redirect(new URL('/maintenance', request.url));
            }
        }
    }

    // ========================================
    // 2. DELIVERY AGENT ROLE RESTRICTION
    // ========================================
    // Delivery agents should ONLY access /livreur routes
    // If they want to shop, they should use a separate buyer account
    const authToken = request.cookies.get('auth-token')?.value;

    if (authToken) {
        try {
            // Decode JWT to get user role (simple decode, no full verification for performance)
            const payload = JSON.parse(
                Buffer.from(authToken.split('.')[1], 'base64').toString()
            );

            const userRole = payload.role;
            const isDeliveryAgent = userRole === 'DELIVERY_AGENT';

            // Whitelist routes delivery agents CAN access
            const allowedForDeliveryAgent =
                pathname.startsWith('/livreur') ||
                pathname.startsWith('/api/deliveries') ||
                pathname.startsWith('/api/delivery') ||
                pathname.startsWith('/login') ||
                pathname.startsWith('/logout') ||
                pathname === '/' || // Allow seeing homepage briefly before redirect
                pathname.startsWith('/_next') || // Next.js internals
                pathname.startsWith('/api/upload'); // For uploading delivery photos

            if (isDeliveryAgent && !allowedForDeliveryAgent) {
                // Redirect to delivery dashboard
                return NextResponse.redirect(new URL('/livreur', request.url));
            }
        } catch (error) {
            // Invalid token, let it continue (will be handled by auth pages)
        }
    }

    // ========================================
    // 3. RATE LIMITING
    // ========================================
    // Protect sensitive API routes
    if (pathname.startsWith('/api/orders') ||
        pathname.startsWith('/api/checkout') ||
        pathname.startsWith('/api/contact')) {

        const identifier = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
        const { limited, remaining, resetTime } = rateLimit(identifier, 20, 60000); // 20 req/min

        if (limited) {
            return new NextResponse(
                JSON.stringify({
                    error: 'Trop de requêtes. Veuillez réessayer dans quelques instants.'
                }),
                {
                    status: 429,
                    headers: {
                        'Content-Type': 'application/json',
                        'X-RateLimit-Limit': '20',
                        'X-RateLimit-Remaining': '0',
                        'X-RateLimit-Reset': new Date(resetTime).toISOString()
                    }
                }
            );
        }

        // Add rate limit headers to response
        const response = NextResponse.next();
        response.headers.set('X-RateLimit-Limit', '20');
        response.headers.set('X-RateLimit-Remaining', remaining.toString());
        response.headers.set('X-RateLimit-Reset', new Date(resetTime).toISOString());
        return response;
    }

    return NextResponse.next();
}

// Apply middleware to all routes except static files
export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization)
         * - favicon.ico (favicon file)
         * - public files (images, etc.)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
    ],
};
