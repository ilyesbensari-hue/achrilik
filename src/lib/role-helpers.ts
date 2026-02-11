import type { Role } from '@prisma/client';

/**
 * User type that supports both legacy role (string) and new roles (array)
 */
export interface UserWithRoles {
    id?: string;
    email?: string;
    name?: string | null;
    role?: Role | string; // Legacy field
    roles?: Role[]; // New array field
    [key: string]: unknown;
}

/**
 * Checks if user has a specific role
 * Supports both legacy role field and new roles array
 */
export function hasRole(user: UserWithRoles, role: Role | string): boolean {
    // Check new roles array first
    if (user.roles && Array.isArray(user.roles)) {
        return user.roles.includes(role as Role);
    }

    // Fallback to legacy role field (comma-separated or single)
    if (user.role) {
        const userRoles = typeof user.role === 'string' ? user.role.split(',') : [user.role];
        return userRoles.includes(role as string);
    }

    return false;
}

/**
 * Checks if user has ANY of the specified roles
 */
export function hasAnyRole(user: UserWithRoles, roles: (Role | string)[]): boolean {
    return roles.some(role => hasRole(user, role));
}

/**
 * Get user's primary role (first role in array or single role)
 */
export function getPrimaryRole(user: UserWithRoles): Role | string | null {
    if (user.roles && Array.isArray(user.roles) && user.roles.length > 0) {
        return user.roles[0];
    }
    return user.role || null;
}
