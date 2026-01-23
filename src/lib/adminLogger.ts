import { prisma } from './prisma';
import { randomBytes } from 'crypto';

interface LogAdminActionParams {
    adminId: string;
    action: string;
    targetType: string;
    targetId?: string;
    productId?: string;
    details?: Record<string, any>;
}

/**
 * Log an admin action to the database
 */
export async function logAdminAction({
    adminId,
    action,
    targetType,
    targetId,
    productId,
    details
}: LogAdminActionParams) {
    try {
        await prisma.adminLog.create({
            data: {
                id: randomBytes(16).toString('hex'),
                adminId,
                action,
                targetType,
                targetId,
                productId,
                details: details ? JSON.stringify(details) : null
            }
        });
    } catch (error) {
        console.error('Failed to log admin action:', error);
        // Don't throw - logging failures shouldn't break the main operation
    }
}

// Common action types
export const AdminActions = {
    APPROVE_PRODUCT: 'APPROVE_PRODUCT',
    REJECT_PRODUCT: 'REJECT_PRODUCT',
    DELETE_USER: 'DELETE_USER',
    UPDATE_USER: 'UPDATE_USER',
    DELETE_PRODUCT: 'DELETE_PRODUCT',
    UPDATE_SETTINGS: 'UPDATE_SETTINGS',
    UPDATE_ORDER_STATUS: 'UPDATE_ORDER_STATUS',
    PROMOTE_USER: 'PROMOTE_USER'
} as const;

// Common target types
export const TargetTypes = {
    PRODUCT: 'PRODUCT',
    USER: 'USER',
    ORDER: 'ORDER',
    SETTINGS: 'SETTINGS'
} as const;
