import crypto from 'crypto';
import type { PrismaClient } from '@prisma/client';

/**
 * Generate a unique tracking number for deliveries
 * Format: ACH-YYYYMMDD-XXXXXX
 */
export function generateTrackingNumber(): string {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `ACH-${dateStr}-${random}`;
}

/**
 * Generate a secure random password
 */
export function generateSecurePassword(length: number = 12): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    const randomBytes = crypto.randomBytes(length);
    let password = '';

    for (let i = 0; i < length; i++) {
        password += charset[randomBytes[i] % charset.length];
    }

    return password;
}

/**
 * Calculate estimated delivery date based on wilaya
 */
export function calculateEstimatedDelivery(wilaya: string): Date {
    const now = new Date();

    // Oran: 1-2 days, Other wilayas: 3-5 days
    const daysToAdd = wilaya.toLowerCase() === 'oran' ? 2 : 4;

    now.setDate(now.getDate() + daysToAdd);
    return now;
}

/**
 * Find the best delivery agent for an order based on:
 * - Same wilaya
 * - Currently available
 * - Lowest active deliveries
 */
export async function findBestDeliveryAgent(
    prisma: PrismaClient,
    wilaya: string
): Promise<string | null> {
    // Find agents covering this wilaya
    const agents = await prisma.deliveryAgent.findMany({
        where: {
            wilayasCovered: {
                has: wilaya
            },
            isActive: true,
        },
        orderBy: {
            totalDeliveries: 'asc' // Agents with fewer total deliveries first
        }
    });

    return agents.length > 0 ? agents[0].id : null;
}

/**
 * Format delivery agent name for display
 */
export function formatAgentName(name: string): string {
    return name.split(' ').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
}

/**
 * Validate Algerian phone number
 */
export function isValidAlgerianPhone(phone: string): boolean {
    // Format: 0XXXXXXXXX (10 digits starting with 0)
    const phoneRegex = /^0[5-7][0-9]{8}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Get delivery status color
 */
export function getDeliveryStatusColor(status: string): string {
    const colors: Record<string, string> = {
        PENDING: 'gray',
        ASSIGNED: 'blue',
        ACCEPTED: 'cyan',
        IN_TRANSIT: 'yellow',
        DELIVERED: 'green',
        FAILED: 'red',
        CANCELLED: 'gray'
    };

    return colors[status] || 'gray';
}

/**
 * Get delivery status label in French
 */
export function getDeliveryStatusLabel(status: string): string {
    const labels: Record<string, string> = {
        PENDING: 'En attente',
        ASSIGNED: 'Assignée',
        ACCEPTED: 'Acceptée',
        IN_TRANSIT: 'En transit',
        DELIVERED: 'Livrée',
        FAILED: 'Échec',
        CANCELLED: 'Annulée'
    };

    return labels[status] || status;
}

/**
 * Calculate delivery agent statistics
 */
export async function calculateAgentStats(prisma: PrismaClient, agentId: string) {
    const deliveries = await prisma.delivery.findMany({
        where: { agentId }
    });

    const total = deliveries.length;
    const delivered = deliveries.filter((d) => d.status === 'DELIVERED').length;
    const failed = deliveries.filter((d) => d.status === 'FAILED').length;
    const inProgress = deliveries.filter((d) =>
        ['ASSIGNED', 'ACCEPTED', 'IN_TRANSIT'].includes(d.status)
    ).length;

    const totalCOD = deliveries
        .filter((d) => d.status === 'DELIVERED' && d.codCollected)
        .reduce((sum, d) => sum + (d.codAmount || 0), 0);

    const successRate = total > 0 ? (delivered / total) * 100 : 0;

    return {
        total,
        delivered,
        failed,
        inProgress,
        totalCOD,
        successRate: Math.round(successRate * 10) / 10
    };
}
