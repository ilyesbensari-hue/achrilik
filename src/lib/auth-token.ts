import { SignJWT, jwtVerify } from 'jose';
import { logger } from './logger';

const SECRET_KEY = process.env.AUTH_SECRET || 'default_secret_key_change_in_production';
const key = new TextEncoder().encode(SECRET_KEY);

export async function signToken(payload: any) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d') // 7 days session
        .sign(key);
}

export async function verifyToken(token: string) {
    try {
        const { payload } = await jwtVerify(token, key, {
            algorithms: ['HS256'],
        });
        return payload;
    } catch (error) {
        // Log JWT verification errors for debugging auth issues
        logger.error('JWT verification failed:', {
            error: error instanceof Error ? error.message : 'Unknown error',
            errorType: error instanceof Error ? error.constructor.name : typeof error
        });
        return null;
    }
}
