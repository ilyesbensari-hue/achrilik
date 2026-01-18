import { prisma } from './prisma';

/**
 * Get a system setting value
 */
export async function getSetting(key: string): Promise<string | null> {
    try {
        const setting = await prisma.systemSettings.findUnique({
            where: { key }
        });
        return setting?.value || null;
    } catch (error) {
        console.error(`Failed to get setting ${key}:`, error);
        return null;
    }
}

/**
 * Get a parsed JSON setting value
 */
export async function getSettingJson<T>(key: string, defaultValue: T): Promise<T> {
    const value = await getSetting(key);
    if (!value) return defaultValue;

    try {
        return JSON.parse(value) as T;
    } catch {
        return defaultValue;
    }
}

/**
 * Set a system setting value
 */
export async function setSetting(
    key: string,
    value: string,
    category: string = 'GENERAL',
    description?: string
) {
    try {
        await prisma.systemSettings.upsert({
            where: { key },
            update: { value, category, description },
            create: { key, value, category, description }
        });
    } catch (error) {
        console.error(`Failed to set setting ${key}:`, error);
        throw error;
    }
}

/**
 * Set a JSON setting value
 */
export async function setSettingJson(
    key: string,
    value: any,
    category: string = 'GENERAL',
    description?: string
) {
    await setSetting(key, JSON.stringify(value), category, description);
}

/**
 * Get all settings by category
 */
export async function getSettingsByCategory(category: string) {
    try {
        return await prisma.systemSettings.findMany({
            where: { category },
            orderBy: { key: 'asc' }
        });
    } catch (error) {
        console.error(`Failed to get settings for category ${category}:`, error);
        return [];
    }
}

/**
 * Delete a setting
 */
export async function deleteSetting(key: string) {
    try {
        await prisma.systemSettings.delete({
            where: { key }
        });
    } catch (error) {
        console.error(`Failed to delete setting ${key}:`, error);
        throw error;
    }
}

// Setting categories
export const SettingCategories = {
    GENERAL: 'GENERAL',
    EMAIL: 'EMAIL',
    PAYMENT: 'PAYMENT',
    SHIPPING: 'SHIPPING'
} as const;
