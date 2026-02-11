import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { logger } from './logger';
import type { Role } from '@prisma/client';

const SECRET_KEY = process.env.AUTH_SECRET || 'default_secret_key_change_in_production';
const key = new TextEncoder().encode(SECRET_KEY);

/**
 * Custom JWT payload type with user fields
 */
export interface JWTUserPayload extends JWTPayload {
    id: string;
    email: string;
    name?: string | null;
    role?: Role | string; // Legacy field for backward compatibility
    roles?: Role[]; // New roles array
    isSeller?: boolean; // Legacy field
    [key: string]: unknown;
}

export async function signToken(payload: Partial<JWTUserPayload>) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d') // 7 days session
        .sign(key);
}

export async function verifyToken(token: string): Promise<JWTUserPayload | null> {
    try {
        const { payload } = await jwtVerify(token, key, {
            algorithms: ['HS256'],
        });
        return payload as JWTUserPayload;
    } catch (error) {
        // Log JWT verification errors for debugging auth issues
        logger.error('JWT verification failed:', {
            error: error instanceof Error ? error.message : 'Unknown error',
            errorType: error instanceof Error ? error.constructor.name : typeof error
        });
        return null;
    }
}
