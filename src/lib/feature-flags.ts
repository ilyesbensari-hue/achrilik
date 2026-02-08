import { prisma } from './prisma';

/**
 * Feature flag constants
 */
export const FEATURES = {
    CHECKOUT: 'checkout',
    ONLINE_PAYMENTS: 'online_payments',
    VISUAL_SEARCH: 'visual_search',
    REVIEWS: 'reviews',
    SELLER_REGISTRATION: 'seller_registration',
    DELIVERY_AGENT_REGISTRATION: 'delivery_agent_registration',
} as const;

/**
 * Check if a feature is enabled via SystemConfig table
 * @param featureName - Feature name from FEATURES constant
 * @returns true if enabled, false if disabled or on error (fail-safe)
 */
export async function isFeatureEnabled(featureName: string): Promise<boolean> {
    try {
        const configKey = `FEATURE_${featureName.toUpperCase()}`;
        const feature = await prisma.systemConfig.findUnique({
            where: { key: configKey }
        });

        // Default to true if not configured (optimistic)
        if (!feature) return true;

        return feature.value === 'true';
    } catch (error) {
        // Fail-safe: if DB is down, disable features to be safe
        console.error('Error checking feature flag:', error);
        return false;
    }
}

/**
 * Set a feature flag value
 * @param featureName - Feature name
 * @param enabled - Enable or disable
 * @param updatedBy - User ID who made the change
 */
export async function setFeatureFlag(
    featureName: string,
    enabled: boolean,
    updatedBy?: string
): Promise<void> {
    const configKey = `FEATURE_${featureName.toUpperCase()}`;

    await prisma.systemConfig.upsert({
        where: { key: configKey },
        update: {
            value: enabled ? 'true' : 'false',
            updatedBy,
            updatedAt: new Date()
        },
        create: {
            key: configKey,
            value: enabled ? 'true' : 'false',
            updatedBy
        }
    });
}

/**
 * Get all feature flags
 */
export async function getAllFeatureFlags(): Promise<Record<string, boolean>> {
    const configs = await prisma.systemConfig.findMany({
        where: {
            key: {
                startsWith: 'FEATURE_'
            }
        }
    });

    return Object.fromEntries(
        configs.map(config => [
            config.key.replace('FEATURE_', '').toLowerCase(),
            config.value === 'true'
        ])
    );
}
