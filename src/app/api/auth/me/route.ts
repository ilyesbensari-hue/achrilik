import { NextResponse, NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth-token';

export async function GET(request: NextRequest) {
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
        return NextResponse.json({ user: null });
    }

    const payload = await verifyToken(token);

    if (!payload) {
        return NextResponse.json({ user: null });
    }

    return NextResponse.json({
        user: {
            id: payload.id as string,
            email: payload.email as string,
            name: payload.name as string,
            role: payload.role as string,
            roles: payload.roles as string[],
            activeRole: payload.activeRole as string
        }
    });
}
