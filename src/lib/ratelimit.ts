import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { logger } from './logger';

// Safe Redis initialization with error handling
let redis: Redis | null = null;
let redisError = false;

try {
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
        redis = new Redis({
            url: process.env.UPSTASH_REDIS_REST_URL,
            token: process.env.UPSTASH_REDIS_REST_TOKEN,
        });
    } else {
        logger.warn('Redis credentials missing - rate limiting disabled');
        redisError = true;
    }
} catch (error) {
    logger.error('Failed to initialize Redis', { error: error as Error });
    redisError = true;
}

/**
 * Safe rate limit wrapper that returns success if Redis is unavailable
 */
function createSafeRateLimit(config: { limiter: any; prefix: string }) {
    if (!redis || redisError) {
        return {
            limit: async () => ({ success: true, limit: 100, remaining: 100, reset: 0 })
        };
    }

    return new Ratelimit({
        redis,
        limiter: config.limiter,
        analytics: true,
        prefix: config.prefix,
    });
}

/**
 * Rate limit for login attempts
 * 5 requests per minute per IP
 */
export const loginRateLimit = createSafeRateLimit({
    limiter: Ratelimit.slidingWindow(5, '1 m'),
    prefix: 'ratelimit:login',
});

/**
 * Rate limit for registration
 * 3 requests per minute per IP
 */
export const registerRateLimit = createSafeRateLimit({
    limiter: Ratelimit.slidingWindow(3, '1 m'),
    prefix: 'ratelimit:register',
});

/**
 * Rate limit for contact form
 * 10 requests per minute per IP
 */
export const contactRateLimit = createSafeRateLimit({
    limiter: Ratelimit.slidingWindow(10, '1 m'),
    prefix: 'ratelimit:contact',
});

/**
 * Rate limit for general API routes
 * 10 requests per minute per IP
 */
export const apiRateLimit = createSafeRateLimit({
    limiter: Ratelimit.slidingWindow(10, '1 m'),
    prefix: 'ratelimit:api',
});

/**
 * Helper to get client IP from request
 */
export function getClientIp(request: Request): string {
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');

    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }

    if (realIp) {
        return realIp;
    }

    return 'unknown';
}
