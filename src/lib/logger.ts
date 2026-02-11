/**
 * Development-only logger utility
 * Prevents console.log in production for security and performance
 */

const isDev = process.env.NODE_ENV !== 'production';

type LogMessage = string;

export const logger = {
    /**
     * Log informational messages (dev only)
     */
    log: (message: LogMessage, ...args: unknown[]) => {
        if (isDev) {
            console.log(message, ...args);
        }
    },

    /**
     * Log errors (always logged for Sentry/monitoring)
     */
    error: (message: LogMessage, ...args: unknown[]) => {
        console.error(message, ...args);
    },

    /**
     * Log warnings (dev only)
     */
    warn: (message: LogMessage, ...args: unknown[]) => {
        if (isDev) {
            console.warn(message, ...args);
        }
    },

    /**
     * Log debug information (dev only)
     */
    debug: (message: LogMessage, ...args: unknown[]) => {
        if (isDev) {
            console.debug(message, ...args);
        }
    },

    /**
     * Log info messages (dev only)
     */
    info: (message: LogMessage, ...args: unknown[]) => {
        if (isDev) {
            console.info(message, ...args);
        }
    },
};
