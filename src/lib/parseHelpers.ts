/**
 * Safe parseInt helper with validation
 * Returns undefined for invalid inputs instead of NaN
 */
export const parseSafeInt = (value: string | null | undefined): number | undefined => {
    if (!value) return undefined;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) || parsed < 0 ? undefined : parsed;
};

/**
 * Safe parseFloat helper with validation
 * Returns undefined for invalid inputs instead of NaN
 */
export const parseSafeFloat = (value: string | null | undefined): number | undefined => {
    if (!value) return undefined;
    const parsed = parseFloat(value);
    return isNaN(parsed) || parsed < 0 ? undefined : parsed;
};
