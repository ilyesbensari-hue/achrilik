/**
 * In-memory rate limiter
 * For production, consider using Redis or external service
 */

interface RateLimitRecord {
    count: number;
    resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

// Cleanup old entries every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitMap.entries()) {
        if (now > record.resetTime) {
            rateLimitMap.delete(key);
        }
    }
}, 5 * 60 * 1000);

export interface RateLimitResult {
    limited: boolean;
    remaining: number;
    resetTime: number;
}

/**
 * Rate limit a request by identifier (usually IP address)
 * @param identifier - Unique identifier (IP, user ID, etc.)
 * @param limit - Maximum requests allowed
 * @param windowMs - Time window in milliseconds
 * @returns Rate limit status
 */
export function rateLimit(
    identifier: string,
    limit: number = 10,
    windowMs: number = 60000 // 1 minute default
): RateLimitResult {
    const now = Date.now();
    const record = rateLimitMap.get(identifier);

    // Create new record or reset if window expired
    if (!record || now > record.resetTime) {
        const resetTime = now + windowMs;
        rateLimitMap.set(identifier, {
            count: 1,
            resetTime
        });
        return {
            limited: false,
            remaining: limit - 1,
            resetTime
        };
    }

    // Increment count
    record.count++;

    // Check if limit exceeded
    if (record.count > limit) {
        return {
            limited: true,
            remaining: 0,
            resetTime: record.resetTime
        };
    }

    return {
        limited: false,
        remaining: limit - record.count,
        resetTime: record.resetTime
    };
}

/**
 * Get current rate limit status without incrementing
 */
export function getRateLimitStatus(identifier: string, limit: number = 10): RateLimitResult {
    const now = Date.now();
    const record = rateLimitMap.get(identifier);

    if (!record || now > record.resetTime) {
        return {
            limited: false,
            remaining: limit,
            resetTime: now + 60000
        };
    }

    return {
        limited: record.count >= limit,
        remaining: Math.max(0, limit - record.count),
        resetTime: record.resetTime
    };
}
