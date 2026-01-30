import { User, Role } from '@prisma/client';

/**
 * Helper functions for multi-role system
 * Provides backward compatibility and role management utilities
 */

/**
 * Check if user has a specific role
 */
export function hasRole(user: User, role: Role): boolean {
    return user.roles.includes(role);
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(user: User, roles: Role[]): boolean {
    return roles.some(role => user.roles.includes(role));
}

/**
 * Check if user has all of the specified roles
 */
export function hasAllRoles(user: User, roles: Role[]): boolean {
    return roles.every(role => user.roles.includes(role));
}

/**
 * Get user's primary role (first role in array)
 */
export function getPrimaryRole(user: User): Role {
    return user.roles[0] || Role.BUYER;
}

/**
 * Check if role is user's primary role
 */
export function isPrimaryRole(user: User, role: Role): boolean {
    return getPrimaryRole(user) === role;
}

/**
 * Get role display name in French
 */
export function getRoleDisplayName(role: Role): string {
    const roleNames: Record<Role, string> = {
        [Role.BUYER]: 'Client',
        [Role.SELLER]: 'Vendeur',
        [Role.DELIVERY_AGENT]: 'Livreur',
        [Role.ADMIN]: 'Administrateur',
    };
    return roleNames[role];
}

/**
 * Get role icon emoji
 */
export function getRoleIcon(role: Role): string {
    const roleIcons: Record<Role, string> = {
        [Role.BUYER]: '🛍️',
        [Role.SELLER]: '🏪',
        [Role.DELIVERY_AGENT]: '🚚',
        [Role.ADMIN]: '⚙️',
    };
    return roleIcons[role];
}

/**
 * Get role dashboard path
 */
export function getRoleDashboardPath(role: Role): string {
    const dashboardPaths: Record<Role, string> = {
        [Role.BUYER]: '/',
        [Role.SELLER]: '/sell',
        [Role.DELIVERY_AGENT]: '/delivery/dashboard',
        [Role.ADMIN]: '/admin',
    };
    return dashboardPaths[role];
}

/**
 * Check if user can access a specific role's features
 * Used for route protection
 */
export function canAccessRole(user: User, requiredRole: Role): boolean {
    return hasRole(user, requiredRole);
}

/**
 * Add a role to user (returns updated roles array)
 */
export function addRole(currentRoles: Role[], newRole: Role): Role[] {
    if (currentRoles.includes(newRole)) {
        return currentRoles;
    }
    return [...currentRoles, newRole];
}

/**
 * Remove a role from user (returns updated roles array)
 * Note: Cannot remove last role, defaults to BUYER
 */
export function removeRole(currentRoles: Role[], roleToRemove: Role): Role[] {
    const filtered = currentRoles.filter(r => r !== roleToRemove);
    return filtered.length > 0 ? filtered : [Role.BUYER];
}

/**
 * Switch primary role (moves role to first position)
 */
export function switchPrimaryRole(currentRoles: Role[], newPrimaryRole: Role): Role[] {
    if (!currentRoles.includes(newPrimaryRole)) {
        return currentRoles;
    }
    return [
        newPrimaryRole,
        ...currentRoles.filter(r => r !== newPrimaryRole)
    ];
}
