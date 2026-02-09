// Simple in-memory cache for Next.js API routes
// For production, use Redis or Vercel KV

interface CacheEntry {
    data: any;
    timestamp: number;
}

class SimpleCache {
    private cache: Map<string, CacheEntry>;
    private defaultTTL: number; // Time to live in seconds

    constructor(defaultTTL: number = 300) { // 5 minutes par défaut
        this.cache = new Map();
        this.defaultTTL = defaultTTL;
    }

    set(key: string, data: any, ttl?: number): void {
        const entry: CacheEntry = {
            data,
            timestamp: Date.now() + (ttl || this.defaultTTL) * 1000
        };
        this.cache.set(key, entry);
    }

    get(key: string): any | null {
        const entry = this.cache.get(key);

        if (!entry) {
            return null;
        }

        // Check if expired
        if (Date.now() > entry.timestamp) {
            this.cache.delete(key);
            return null;
        }

        return entry.data;
    }

    delete(key: string): void {
        this.cache.delete(key);
    }

    clear(): void {
        this.cache.clear();
    }

    // Clean expired entries
    cleanup(): void {
        const now = Date.now();
        for (const [key, entry] of this.cache.entries()) {
            if (now > entry.timestamp) {
                this.cache.delete(key);
            }
        }
    }
}

// Singleton instance
const cache = new SimpleCache(300); // 5 minutes TTL par défaut

// Cleanup every 10 minutes
if (typeof setInterval !== 'undefined') {
    setInterval(() => cache.cleanup(), 10 * 60 * 1000);
}

export default cache;

// Helper function for cache-wrapped API calls
export async function withCache<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number
): Promise<T> {
    // Check cache first
    const cached = cache.get(key);
    if (cached !== null) {
        if (process.env.NODE_ENV === 'development') {
            console.log(`[CACHE HIT] ${key}`);
        }
        return cached as T;
    }

    // Fetch fresh data
    if (process.env.NODE_ENV === 'development') {
        console.log(`[CACHE MISS] ${key}`);
    }
    const data = await fetcher();

    // Store in cache
    cache.set(key, data, ttl);

    return data;
}
