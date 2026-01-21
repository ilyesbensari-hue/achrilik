import { NextResponse } from 'next/server';

export async function POST() {
    // Clear the auth_token cookie by setting it to expire in the past
    const isProduction = process.env.NODE_ENV === 'production';
    const domain = isProduction ? '.achrilik.com' : undefined;

    const cookieHeader = [
        'auth_token=',
        'HttpOnly',
        isProduction ? 'Secure' : '',
        'SameSite=Lax',
        'Path=/',
        domain ? `Domain=${domain}` : '',
        'Max-Age=0', // Expire immediately
        'Expires=Thu, 01 Jan 1970 00:00:00 GMT' // Also set explicit past date
    ].filter(Boolean).join('; ');

    const response = NextResponse.json({ success: true });
    response.headers.set('Set-Cookie', cookieHeader);

    return response;
}
