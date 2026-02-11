/**
 * Development-only logger utility
 * Prevents console.log in production for security and performance
 */

const isDev = process.env.NODE_ENV !== 'production';

export const logger = {
    /**
     * Log informational messages (dev only)
     */
    log: (...args: any[]) => {
        if (isDev) console.log(...args);
    },

    /**
     * Log errors (always logged for Sentry/monitoring)
     */
    error: (...args: any[]) => {
        console.error(...args);
    },

    /**
     * Log warnings (dev only)
     */
    warn: (...args: any[]) => {
        if (isDev) console.warn(...args);
    },

    /**
     * Log debug information (dev only)
     */
    debug: (...args: any[]) => {
        if (isDev) console.debug(...args);
    },

    /**
     * Log info messages (dev only)
     */
    info: (...args: any[]) => {
        if (isDev) console.info(...args);
    },
};
